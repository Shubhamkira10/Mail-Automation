from google import genai
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import json
import re 
from sentiment import predict_sentiment
from business_rules import (
    STATUS_INSTRUCTIONS,
    STATUS_POLICIES,
    COMPANY_POLICIES,
    REQUIRED_RESPONSE_KEYS,
    ALLOWED_INTENTS,
    BACKEND_ACTIONS
)
import os
import time
import base64

MAX_RETRIES = 5

ADMIN_EMAILS = {
    "shubhamjpsingh9@gmail.com",
    "admin@elementalconcept.com"
}

DATABASE_DIR = "database"

ADMIN_FILES = {
    "orders": os.path.join(DATABASE_DIR, "orders.json"),
    "customers": os.path.join(DATABASE_DIR, "customers.json"),
    "products": os.path.join(DATABASE_DIR, "products.json"),
    "conversations": os.path.join(DATABASE_DIR, "conversations.json"),
    "email logs": os.path.join(DATABASE_DIR, "email_logs.json"),
}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-flash-latest"
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
SENDER_EMAIL = "shubhamjpsingh9@gmail.com"
SENDER_NAME = "Elemental Concept"

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found.")

if not BREVO_API_KEY:
    raise ValueError("BREVO_API_KEY not found.")


client = genai.Client(api_key=GEMINI_API_KEY)

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key["api-key"] = BREVO_API_KEY
api_client = sib_api_v3_sdk.ApiClient(configuration)
api_instance = sib_api_v3_sdk.TransactionalEmailsApi(api_client)

from database import (
    get_order,
    get_customer,
    get_product,
)

def generate_reply(mail):

    sender_email = mail.get("from", "").lower()
    is_admin = sender_email in ADMIN_EMAILS
    
    customer_subject = mail.get("subject", "")
    customer_message = mail.get("body", "")

    email_text = f"""Subject:
{customer_subject}

Message:
{customer_message}
"""

    result = predict_sentiment(email_text) or {}

    sentiment = result.get("sentiment")
    confidence = result.get("confidence", 0.0)

    if sentiment is not None:

        print(f"Sentiment : {sentiment}")
        print(f"Confidence: {confidence:.2%}")

        if (sentiment == "POSITIVE"and confidence >= 0.99):
            return positive_reply()

    else:
        print("Sentiment Analysis S.")

    order_id = extract_order_id(email_text)

    order = None
    customer = {}
    product = {}
    
    if order_id:
        order = get_order(order_id)
    
        if order is None:
            return invalid_order_reply(order_id)
    
        customer = get_customer(order["customer_id"]) or {}
        product = get_product(order["product_id"]) or {}
    
    status = order.get("status", "Unknown") if order else "Unknown"
    
    instruction = STATUS_INSTRUCTIONS.get(
        status,
        STATUS_INSTRUCTIONS["Unknown"]
    )
    
    policy = STATUS_POLICIES.get(
        status,
        STATUS_POLICIES["Unknown"]
    )

    status_instruction = instruction["instructions"]
    
    context = {
    "order_found": order is not None,
    "order_id": order_id,
    "customer": customer,
    "product": product,
    "order": order,
    "status_instruction": status_instruction,
    "status_policy": policy,
    "company_policy": COMPANY_POLICIES
}
    admin_instruction = ""
    if is_admin:
        admin_instruction = f"""
    The sender is an ADMIN.
    
    Available internal files:
    
    {list(ADMIN_FILES.keys())}
    
    If the admin asks for one of these files,
    return an additional JSON field:
    
    "attachment": "<file_name>"
    
    Otherwise:
    
    "attachment": null
    """
    
    prompt = f"""
You are a Senior Customer Support Executive at ELEMENTAL CONCEPT.
Your primary goal is to resolve the customer's problem while maintaining a natural, empathetic conversation.
Always understand WHY the customer is contacting support before deciding HOW to respond.
If information is missing, explain what is needed and why it is needed instead of giving a generic response.

Write a reply that sounds like an experienced human customer support executive.

The email should:

- Feel natural.
- Avoid robotic language.
- Show empathy.
- Address every question asked by the customer.
- Use the Order Details whenever relevant.
- Never invent information.
- Never promise actions that haven't happened.
--------------------------------------------------
ADMIN INSTRUCTION

{admin_instruction}
--------------------------------------------------
Customer Email

{email_text}

--------------------------------------------------
Customer Context (Internal Use Only)

{json.dumps(context, indent=4)}
--------------------------------------------------
Rules:

- Use ONLY the information provided.
- Do NOT invent order details.
- Do NOT invent delivery dates.
- Do NOT promise actions that haven't happened.
- Never expose internal business rules.
- Answer every customer question.
- Keep the reply between 120-250 words.
- Use a warm and professional tone.
- Return ONLY valid JSON.
- Never say an action has already been completed.
- Be polite and empathetic.
- If the customer asks multiple questions, answer all of them.
- Use the Order Details above whenever applicable.
- End every email exactly with:

Best Regards,

ELEMENTAL CONCEPT
AI Customer Support Executive

Return ONLY valid JSON in this exact format:

{{
    "intent": "...",
    "backend_action": "...",
    "parameters": {{}},
    "subject": "...",
    "reply": "...",
    "attachment": null
}}
--------------------------------------------------
Order Handling Rules

The "order_found" field tells you whether a valid order was located.

If order_found is false:

- Do NOT invent any order information.
- Do NOT assume an order exists.
- First understand the customer's intent.
- Respond naturally to that intent.
- Explain that you cannot verify the order until you receive enough information.
- Ask for the Order ID.
- If the customer does not know the Order ID, ask for any of:
  • Email used while placing the order
  • Registered mobile number
  • Product name
  • Approximate purchase date
- If the customer expresses frustration, delay, cancellation, refund, or another issue, acknowledge that concern before asking for the missing information.
- Never respond with only "Please provide your Order ID."
--------------------------------------------------
Before writing the reply:

1. Determine the customer's primary intent.
2. Determine whether enough information is available to resolve it.
3. If information is missing, explain what is needed while still addressing the customer's concern.
4. Then generate the reply.
--------------------------------------------------
Allowed intent values:
{json.dumps(sorted(list(ALLOWED_INTENTS)), indent=4)}
Choose ONLY ONE intent from this list.
Never invent a new intent.

Allowed backend_action values:
{json.dumps(sorted(list(BACKEND_ACTIONS)), indent=4)}

Rules:

- Choose ONLY ONE backend_action.
- Never invent a backend_action.
- If no backend action is required, return "NONE".
- Put any extracted values inside "parameters".

Do not wrap the JSON inside markdown.
Do not add explanations.
Do not write ```json.
"""
    try:

        for attempt in range(MAX_RETRIES):
            try:
                response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
                )
                break
            
            except Exception as e:
                print(f"\nGemini Error (Attempt {attempt+1}/{MAX_RETRIES})")
                print(e)

                if attempt == MAX_RETRIES - 1:
                    return None

                print("Retrying in 5 seconds...")
                time.sleep(5)

        text = response.text.strip()

        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

        try:
            result = json.loads(text)
            
            attachment = result.get("attachment")
            attachment_path = None
            
            if attachment in ADMIN_FILES:
                attachment_path = ADMIN_FILES[attachment]
            
            result["attachment_path"] = attachment_path
            
            print("\nLLM Response")
            print(json.dumps(result, indent=4))

            for key in REQUIRED_RESPONSE_KEYS:
                if key not in result:
                    raise ValueError(f"Missing key: {key}")


            if result["backend_action"] not in BACKEND_ACTIONS:
                raise ValueError(
                    f"Unknown backend action: {result['backend_action']}"
                )
            
            if result["intent"] not in ALLOWED_INTENTS:
                raise ValueError(
                    f"Unknown intent: {result['intent']}"
                )

            result["order"] = order
            result["order_id"] = order["order_id"] if order else None
            return result

        except (json.JSONDecodeError, ValueError) as e:

            print("\nGemini returned an invalid response.")
            print(f"Reason: {e}")
            with open("gemini_error.log", "a", encoding="utf-8") as f:
                f.write(text)
                f.write("\n\n")

            return {
                "subject": "Error",
                "reply": "Unable to generate a response."
            }

    except Exception as e:

        print("Unexpected Error:", e)

        return None

def extract_order_id(text):

    match = re.search(r"ORD\d+", text, re.IGNORECASE)

    if match:
        return match.group().upper()

    return None
    
def send_email(receiver_email, subject, body, attachment_path=None):
    attachments = None
    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            encoded_file = base64.b64encode(f.read()).decode("utf-8")

        attachments = [
            {
                "name": os.path.basename(attachment_path),
                "content": encoded_file
            }
        ]

    email = sib_api_v3_sdk.SendSmtpEmail(
        sender={
            "name": SENDER_NAME,
            "email": SENDER_EMAIL
        },

        to=[
            {
                "email": receiver_email
            }
        ],

        subject=subject,
        text_content=body,
        attachment=attachments
    )

    try:
        response = api_instance.send_transac_email(email)
        print("\nEmail Sent Successfully!")
        print(response)

        if attachment_path:
            print(f"Attachment Sent: {attachment_path}")
            
    except ApiException as e:
        print("\nBrevo Error:\n")
        print(e)

def invalid_order_reply(order_id):

    return {
        "intent": "Invalid Order ID",
        "backend_action": "NONE",
        "parameters": {},
        "subject": "Unable to Locate Your Order",
        "reply": f"""Dear Customer,

Thank you for contacting ELEMENTAL CONCEPT.

We searched our records using the Order ID **{order_id}**, but we were unable to locate a matching order.

Could you please verify that the Order ID is correct and resend it? If possible, you may also share:

• The email address used to place the order
• Approximate purchase date
• Product name

Once we receive the correct information, we'll be happy to assist you further.

Best Regards,

ELEMENTAL CONCEPT
AI Customer Support Executive""",
        "order": None,
        "order_id": None
    }

def positive_reply():

    return {
        "intent": "Positive Feedback",
        "backend_action": "NONE",
        "parameters": {},
        "subject": "Thank You for Your Feedback",
        "reply": """Dear Customer,

            Thank you for taking the time to share your valuable feedback with us.

            We truly appreciate your kind words and are delighted to know that you had a positive experience with our service. Feedback like yours motivates our team to continue providing excellent customer service.

            We look forward to serving you again in the future.

            Best Regards,

            ELEMENTAL CONCEPT
            AI Customer Support Executive""",
        "order": None,
        "order_id": None
    } 

## MANUAL TESTING 
# if __name__ == "__main__":

#     print("AI Customer Support")

#     customer_email = input("\nCustomer Email Address : ")
#     customer_message = get_customer_email()

#     print("\nGenerating Reply...\n")
#     result = generate_reply(customer_message)

#     if result is None:
#         print("Failed to generate reply.")
#         exit()

#     intent = result["intent"]
#     backend_action = result["backend_action"]
#     parameters = result["parameters"]
#     subject = result["subject"]
#     reply = result["reply"]
    
#     order = result["order"]

#     perform_backend_action(
#         result["backend_action"],
#         order,
#         result["parameters"]
#     )

#     print("Generated Subject")
#     print(subject)

#     print("\n")

#     print("Intent         :", intent)
#     print("Backend Action :", backend_action)
#     print("Parameters     :", parameters)

#     print("\n")

#     print("Generated Reply")
#     print(reply)

#     print("\n")

#     choice = input("\nSend Email? (y/n): ")

#     if choice.lower() == "y":

#         send_email(
#             customer_email,
#             subject,
#             reply
#         )

#     else:

#         print("\nEmail not sent.")

# def get_customer_email():
#     print("\nPaste the customer's email below.")
#     print("Type END on a new line when finished.\n")
#     lines = []
#     while True:
#         line = input()
#         if line.strip().upper() == "END":
#             break

#         lines.append(line)
#     return "\n".join(lines)
