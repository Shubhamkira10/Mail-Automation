from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
import traceback

from llm_reply import generate_reply, send_email
from backend import perform_backend_action, current_time
from database import (
    ORDERS,
    PRODUCTS,
    CUSTOMERS,
    TICKETS,
    EMAIL_LOGS,
    CONVERSATIONS,
    get_order,
    get_customer,
    get_product,
    get_email_log,
    add_email_log,
    add_message,
    get_conversation,
)

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dashboard", "dist")
app = Flask(__name__)
CORS(app)


@app.route("/email", methods=["POST"])
def receive_email():

    try:

        data = request.get_json()

        customer_email = data["envelope"]["from"]
        customer_subject = data["headers"]["subject"]
        customer_message = data["plain"]

        print("=" * 60)
        print("New Customer Email")
        print("=" * 60)

        print(f"From    : {customer_email}")
        print(f"Subject : {customer_subject}")
        print(f"Message :\n{customer_message}")

        mail = {
            "from": customer_email,
            "subject": customer_subject,
            "body": customer_message
        }

        headers = data.get("headers", {})

        message_id = (
            headers.get("message_id")
            or headers.get("message-id")
            or headers.get("Message-ID")
        )

        if not message_id:
           message_id = f"TEST-{uuid.uuid4()}"
            
        headers = data.get("headers", {})
        

        if message_id and get_email_log(message_id):
            print("Duplicate email received. Ignoring.")
            return "Already Processed", 200

        result = generate_reply(mail)

        if result is None:
            return "Generation Failed", 500

        order = result.get("order")
        order_id = order.get("order_id") if order else None

        if result.get("backend_action") != "NONE" and order:
            perform_backend_action(
                result["backend_action"],
                order,
                result["parameters"]
            )

        send_email(
            mail["from"],
            result["subject"],
            result["reply"]
        )

        conversation = add_message(
            order_id,
            customer_email,
            {
                "message_id": message_id,
                "direction": "incoming",
                "channel": "Email",
                "sender": customer_email,
                "subject": customer_subject,
                "body": customer_message,
                "timestamp": current_time()
            }
        )
        
        add_message(
            order_id,
            customer_email,
            {
                "message_id": message_id,
                "direction": "outgoing",
                "channel": "Email",
                "sender": "Elemental Concept",
                "subject": result["subject"],
                "body": result["reply"],
                "timestamp": current_time()
            },
        )

        add_email_log(
            {
                "message_id": message_id,
                "customer_email": customer_email,
                "order_id": order_id,
                "backend_action": result["backend_action"],
                "processed_at": current_time(),
                "status": "Processed"
            }
        )
        return "OK", 200

    except Exception :
        traceback.print_exc()
        return "Internal Server Error", 500


def get_conversation_by_id(conversation_id):
    return find_by_key(
        CONVERSATIONS,
        "conversation_id",
        conversation_id
    )

# ──────────────────────────────────────────────
# Dashboard API Endpoints
# ──────────────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
def dashboard_stats():
    order_statuses = {}
    for o in ORDERS:
        s = o.get("status", "Unknown")
        order_statuses[s] = order_statuses.get(s, 0) + 1

    ticket_statuses = {}
    ticket_types = {}
    for t in TICKETS:
        ts = t.get("status", "Unknown")
        ticket_statuses[ts] = ticket_statuses.get(ts, 0) + 1
        tt = t.get("type", "Unknown")
        ticket_types[tt] = ticket_types.get(tt, 0) + 1

    action_counts = {}
    for e in EMAIL_LOGS:
        a = e.get("backend_action", "NONE")
        action_counts[a] = action_counts.get(a, 0) + 1

    return jsonify({
        "total_orders": len(ORDERS),
        "total_customers": len(CUSTOMERS),
        "total_tickets": len(TICKETS),
        "total_emails": len(EMAIL_LOGS),
        "total_products": len(PRODUCTS),
        "total_conversations": len(CONVERSATIONS),
        "order_statuses": order_statuses,
        "ticket_statuses": ticket_statuses,
        "ticket_types": ticket_types,
        "action_counts": action_counts,
    })


@app.route("/api/orders", methods=["GET"])
def get_orders():
    enriched = []
    for o in ORDERS:
        item = dict(o)
        c = get_customer(o.get("customer_id"))
        p = get_product(o.get("product_id"))
        item["customer_name"] = c["name"] if c else "Unknown"
        item["customer_email"] = c["email"] if c else "Unknown"
        item["product_name"] = p["product_name"] if p else "Unknown"
        enriched.append(item)
    return jsonify(enriched)


@app.route("/api/orders/<order_id>", methods=["GET"])
def get_single_order(order_id):
    o = get_order(order_id)
    if not o:
        return jsonify({"error": "Order not found"}), 404
    item = dict(o)
    c = get_customer(o.get("customer_id"))
    p = get_product(o.get("product_id"))
    item["customer_name"] = c["name"] if c else "Unknown"
    item["customer_email"] = c["email"] if c else "Unknown"
    item["product_name"] = p["product_name"] if p else "Unknown"
    conv = get_conversation(order_id)
    item["conversation"] = conv
    return jsonify(item)


@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    enriched = []
    for t in TICKETS:
        item = dict(t)
        c = get_customer(t.get("customer_id"))
        item["customer_name"] = c["name"] if c else "Unknown"
        item["customer_email"] = c["email"] if c else "Unknown"
        enriched.append(item)
    return jsonify(enriched)


@app.route("/api/customers", methods=["GET"])
def get_customers():
    enriched = []
    for c in CUSTOMERS:
        item = dict(c)
        item["order_count"] = sum(1 for o in ORDERS if o.get("customer_id") == c["customer_id"])
        item["ticket_count"] = sum(1 for t in TICKETS if t.get("customer_id") == c["customer_id"])
        enriched.append(item)
    return jsonify(enriched)


@app.route("/api/customers/<customer_id>", methods=["GET"])
def get_single_customer(customer_id):
    c = get_customer(customer_id)
    if not c:
        return jsonify({"error": "Customer not found"}), 404
    item = dict(c)
    item["orders"] = [o for o in ORDERS if o.get("customer_id") == customer_id]
    item["tickets"] = [t for t in TICKETS if t.get("customer_id") == customer_id]
    return jsonify(item)


@app.route("/api/emails", methods=["GET"])
def get_emails():
    enriched = []
    for e in EMAIL_LOGS:
        item = dict(e)
        o = get_order(e.get("order_id"))
        item["order_status"] = o["status"] if o else "Unknown"
        enriched.append(item)
    return jsonify(enriched)


@app.route("/api/conversations", methods=["GET"])
def get_conversations():
    enriched = []
    for conv in CONVERSATIONS:
        item = dict(conv)
        o = get_order(conv.get("order_id"))
        item["order_status"] = o["status"] if o else "Unknown"
        item["message_count"] = len(conv.get("messages", []))

        if o:
            c = get_customer(o.get("customer_id"))
            item["customer_name"] = c["name"] if c else "Unknown"
            item["customer_email"] = c["email"] if c else "Unknown"
        else:
            incoming = next((m for m in conv.get("messages", []) if m.get("direction") == "incoming"), None)
            item["customer_name"] = incoming["sender"] if incoming else "Unknown"
            item["customer_email"] = incoming["sender"] if incoming else "Unknown"

        enriched.append(item)
    return jsonify(enriched)


@app.route("/api/conversations/id/<conversation_id>")
def get_single_conversation(conversation_id):

    conv = get_conversation_by_id(conversation_id)

    if not conv:
        return jsonify({"error": "Conversation not found"}), 404

    return jsonify(conv)

@app.route("/api/products", methods=["GET"])
def get_products():
    enriched = []
    for p in PRODUCTS:
        item = dict(p)
        item["order_count"] = sum(1 for o in ORDERS if o.get("product_id") == p["product_id"])
        enriched.append(item)
    return jsonify(enriched)


@app.route("/")
def serve_index():
    return send_from_directory(DIST_DIR, "index.html")

@app.route("/version")
def version():
    return {
        "version": "2026-07-18-conversation-fix"
    }

@app.route("/<path:path>")
def serve_static(path):
    file_path = os.path.join(DIST_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
