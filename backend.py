from datetime import datetime
import uuid

from database import (
    add_ticket,
    update_order
)

TICKET_STATUS = "Open"


def perform_backend_action(action, order, parameters):
    if action == "NONE":
        return

    elif action == "CREATE_REPLACEMENT_REQUEST":
        return create_replacement(order)

    elif action == "CREATE_RETURN_REQUEST":
        return create_return(order)

    elif action == "CREATE_REFUND_REQUEST":
        return create_refund(order)

    elif action == "CREATE_INVESTIGATION":
        return create_investigation(order)

    elif action == "CREATE_CANCELLATION_REQUEST":
        return create_cancellation(order)

    elif action == "UPDATE_DELIVERY_ADDRESS":
        return update_address(order, parameters)

    elif action == "UPDATE_ORDER_ITEM":
        return update_order_item(order, parameters)

    elif action == "GENERATE_GST_INVOICE":
        return generate_invoice(order)

    elif action == "APPLY_DISCOUNT_REQUEST":
        return apply_discount(order)

    elif action == "TRACK_ORDER":
        return track_order(order)

    else:
        raise ValueError(f"Unknown backend action: {action}")


def create_replacement(order):
    return create_ticket(order, "REP", "Replacement")

def create_return(order):
    return create_ticket(order, "RET", "Return")

def create_refund(order):
    return create_ticket(order, "REF", "Refund")

def create_investigation(order):
    return create_ticket(order, "INV", "Investigation")

def create_cancellation(order):
    return create_ticket(order, "CAN", "Cancellation")


def generate_invoice(order):
    return create_ticket(order, "GST", "GST Invoice")

def apply_discount(order):
    return create_ticket(order, "DIS", "Coupon Request")


def update_address(order, parameters):

    new_address = parameters.get("new_address")
    if not new_address:
        return None

    order["address"] = new_address
    order["updated_at"] = current_time()
    order["last_action"] = "Address Updated"
    update_order(order)
    return order

def update_order_item(order, parameters):
    order["item_update_request"] = {
        "status": "Pending",
        "requested_changes": parameters,
        "requested_at": current_time()
    }
    order["updated_at"] = current_time()
    order["last_action"] = "Item Update Requested"
    update_order(order)
    return order


def track_order(order):
    order["last_tracking_request"] = current_time()
    order["tracking_requests"] = (
        order.get("tracking_requests", 0) + 1
    )
    update_order(order)
    return order


def create_ticket(order, prefix, ticket_type):

    ticket = {
        "ticket_id": generate_ticket_id(prefix),
        "order_id": order["order_id"],
        "customer_id": order["customer_id"],
        "type": ticket_type,
        "status": TICKET_STATUS,
        "created_at": current_time()
    }
    add_ticket(ticket)
    return ticket



def current_time():

    return datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

def generate_ticket_id(prefix):

    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"