
STATUS_INSTRUCTIONS = {
    "Delivered": {
        "instructions": """
        The order has been successfully delivered.
        If the customer claims the package was not received:

        - Inform them that our records indicate successful delivery.
        - Ask them to check with neighbours, security personnel, reception desk, or family members.
        - If the package is still missing, initiate a delivery investigation.
        - Never assume the package is permanently lost.
        """
    },
    "Processing": {
        "instructions": """
        The order is currently being prepared for shipment.
        The customer may still be able to:
        - Update the delivery address.
        - Modify ordered items.
        - Cancel the order.
        Changes are subject to warehouse processing status.
        """
    },
    "In Transit": {
        "instructions": """
        The shipment has left the warehouse and is currently moving through the courier network.
        Provide tracking information whenever available.
        Address modification or cancellation is generally no longer possible.
        """
    },
    "Out for Delivery": {
        "instructions": """
        The shipment is currently with the delivery partner and is expected to arrive today.
        Delivery modifications are generally unavailable.
        If the customer cannot receive the package, suggest contacting the courier directly if supported.
        """
    },
    "Delayed": {
        "instructions": """
        The shipment has experienced an unexpected delay.
        Apologize sincerely.
        Share the latest estimated delivery date.
        Cancellation requests may be reviewed according to company policy.
        """
    },
    "Cancelled": {
        "instructions": """
        The order has been cancelled successfully.
        If payment was completed, explain the refund timeline.
        """
    },
    "Returned": {
        "instructions": """
        The returned package has been received.
        Explain that inspection is underway.
        Refund or replacement will be processed after inspection.
        """
    },
    "Refunded": {
        "instructions": """
        The refund has already been processed.
        Explain that the credit may take several business days depending on the payment provider.
        """
    },
    "Unknown": {
        "instructions": """
        The order status could not be determined.
        Ask the customer for additional information if necessary.
        """
    }
}

STATUS_POLICIES = {
    "Delivered": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": True,
        "customer_action_required": False
    },
    "Processing": {
        "allow_address_change": True,
        "allow_item_change": True,
        "allow_invoice": True,
        "allow_coupon": True,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "In Transit": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "Out for Delivery": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "Delayed": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "Cancelled": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "Returned": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "Refunded": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": True,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": False
    },
    "Unknown": {
        "allow_address_change": False,
        "allow_item_change": False,
        "allow_invoice": False,
        "allow_coupon": False,
        "requires_investigation": False,
        "customer_action_required": True
    }
}

COMPANY_POLICIES = {
    "invoice_available": True,
    "refund_processing_days": "5-7 Business Days",
    "replacement_processing_days": "2-3 Business Days",
    "return_window_days": 30,
    "replacement_window_days": 7,
    "address_change_before_dispatch": True,
    "investigation_response_time": "48 Hours",
    "customer_support_hours": "09:00 - 18:00 IST"
}
#Service Level Agreement


BACKEND_ACTIONS = {
    "NONE",
    "TRACK_ORDER",
    "CREATE_INVESTIGATION",
    "CREATE_REPLACEMENT_REQUEST",
    "CREATE_CANCELLATION_REQUEST",
    "CREATE_RETURN_REQUEST",
    "CREATE_REFUND_REQUEST",
    "UPDATE_DELIVERY_ADDRESS",
    "UPDATE_ORDER_ITEM",
    "GENERATE_GST_INVOICE",
    "APPLY_DISCOUNT_REQUEST"
}

REQUIRED_RESPONSE_KEYS = (
    "intent",
    "backend_action",
    "parameters",
    "subject",
    "reply"
)

ALLOWED_INTENTS = {
    "Order Status",
    "Replacement Request",
    "Return Request",
    "Refund Request",
    "Address Change",
    "Invoice Request",
    "Coupon Request",
    "Delivery Delay",
    "Complaint",
    "Positive Feedback",
    "General Query"
}

INVESTIGATION_TYPES = {
    "Package Not Received",
    "Wrong Item Delivered",
    "Missing Item",
    "Damaged Product",
    "Missing Accessories",
    "Delivery Dispute"
}

TICKET_STATUS = {
    "Open",
    "Pending",
    "Resolved",
    "Closed"
}

ORDER_STATUS = {
    "Processing",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Delayed",
    "Cancelled",
    "Returned",
    "Refunded"
}