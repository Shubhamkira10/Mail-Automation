import json
import uuid

def load_database():

    global ORDERS
    global PRODUCTS
    global CUSTOMERS
    global TICKETS
    global EMAIL_LOGS
    global CONVERSATIONS

    with open("database/orders.json", encoding="utf-8") as f:
        ORDERS = json.load(f)

    with open("database/products.json", encoding="utf-8") as f:
        PRODUCTS = json.load(f)

    with open("database/customers.json", encoding="utf-8") as f:
        CUSTOMERS = json.load(f)

    with open("database/tickets.json", encoding="utf-8") as f:
        TICKETS = json.load(f)

    with open("database/email_logs.json", encoding="utf-8") as f:
        EMAIL_LOGS = json.load(f)

    with open("database/conversations.json", encoding="utf-8") as f:
        CONVERSATIONS = json.load(f)

#GET
def get_order(order_id):
    return find_by_key(
        ORDERS,
        "order_id",
        order_id
    )

def get_customer(customer_id):
    return find_by_key(
        CUSTOMERS,
        "customer_id",
        customer_id
    )

def get_product(product_id):
    return find_by_key(
        PRODUCTS,
        "product_id",
        product_id
    )

def get_ticket(ticket_id):
    return find_by_key(
        TICKETS,
        "ticket_id",
        ticket_id
    )

def get_email_log(message_id):
    return find_by_key(
        EMAIL_LOGS,
        "message_id",
        message_id
    )

def get_conversation(order_id):
    return find_by_key(
        CONVERSATIONS,
        "order_id",
        order_id
    )

def get_conversation_by_id(conversation_id):
    return find_by_key(
        CONVERSATIONS,
        "conversation_id",
        conversation_id
    )

def get_unmatched_conversation(sender_email):
    for conv in CONVERSATIONS:
        if (
            conv.get("order_id") is None and
            conv.get("customer_email") == sender_email
        ):
            return conv
    return None

#ADD
def add_ticket(ticket):
    TICKETS.append(ticket)
    save_tickets()

def add_order(order):
    ORDERS.append(order)
    save_orders()

def add_email_log(log):
    EMAIL_LOGS.append(log)
    save_email_logs()

def add_conversation(conversation):
    CONVERSATIONS.append(conversation)
    save_conversations()

def add_message(order_id, sender_email, message):
    if order_id:
        conversation = get_conversation(order_id)
    else:
        conversation = get_unmatched_conversation(sender_email)

    if conversation is None:
        conversation = {
            "conversation_id": f"CONV-{uuid.uuid4().hex[:8]}",
            "order_id": order_id,
            "customer_email": sender_email,
            "order_status": None,
            "messages": []
        }
        CONVERSATIONS.append(conversation)

    elif order_id is None:
        conversation["customer_email"] = sender_email
    
    conversation["messages"].append(message)
    save_conversations()
    return conversation

#Update
def update_order(order):
    save_orders()

def update_product(product):
    save_products()

def update_customer(customer):
    save_customers()

#SAVE
def save_orders():
    with open("database/orders.json","w") as f:
        json.dump(
            ORDERS,
            f,
            indent=4,
            ensure_ascii=False
        )

def save_products():
    with open("database/products.json","w") as f:
        json.dump(
            PRODUCTS,
            f,
            indent=4,
            ensure_ascii=False
        )

def save_customers():
    with open("database/customers.json","w") as f:
        json.dump(
            CUSTOMERS,
            f,
            indent=4,
            ensure_ascii=False
        )

def save_tickets():
    with open("database/tickets.json", "w") as f:
        json.dump(
            TICKETS,
            f,
            indent=4,
            ensure_ascii=False
        )

def save_email_logs():
    with open("database/email_logs.json", "w") as f:
        json.dump(
            EMAIL_LOGS,
            f,
            indent=4,
            ensure_ascii=False
        )

def save_conversations():
    with open("database/conversations.json", "w") as f:
        json.dump(
            CONVERSATIONS,
            f,
            indent=4,
            ensure_ascii=False
        )


def find_by_key(data, key, value):
    for item in data:
        if item[key] == value:
            return item
    return None

load_database()
