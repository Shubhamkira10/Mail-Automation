#  AI-Powered Customer Support Email Automation System

An intelligent email automation system that receives customer emails, understands customer intent using AI, performs backend business operations automatically, and sends human-like professional email replies.

The project simulates a real-world customer support workflow used by modern e-commerce companies.

---

#  Features

-  Receive customer emails automatically using CloudMailin
-  AI-generated customer support replies using Google Gemini 2.5 Flash
-  Sentiment Analysis using DistilBERT
-  Order lookup from database
-  Customer information retrieval
-  Product information retrieval
-  Status-based business rules engine
-  Automatic backend action execution
-  Ticket generation (Refund, Return, Investigation, etc.)
-  Automatic email replies using Brevo
-  Duplicate email detection using Message-ID
-  Conversation history management
-  Email logging
-  JSON response validation
-  Automatic retry mechanism for Gemini API
- 🛡 Robust exception handling

---

# 🏗 Project Architecture

```text
                    Customer
                        │
                        ▼
              Sends Email Complaint
                        │
                        ▼
                  CloudMailin
          (Receives Incoming Email)
                        │
                        ▼
                Flask Webhook Server
                   (server.py)
                        │
                        ▼
            Duplicate Email Detection
                 (Message-ID Check)
                        │
                        ▼
             DistilBERT Sentiment Analysis
                        │
                        ▼
              Google Gemini 2.5 Flash
         (Intent + Professional Reply)
                        │
                        ▼
             Business Rules Engine
                        │
                        ▼
            Backend Automation Layer
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
 Update Orders     Create Tickets    Update Address
      │
      ▼
 JSON Database Updated
      │
      ▼
 Send Reply using Brevo API
      │
      ▼
 Customer Receives AI Response
```

---

# 🛠 Tech Stack

## Programming Language

- Python 3.10+

---

## Backend

- Flask
- REST API
- Webhooks

---

## Artificial Intelligence

- Google Gemini 2.5 Flash
- Google GenAI SDK

---

## Machine Learning / NLP

- Hugging Face Transformers
- DistilBERT
- PyTorch

---

## Email Services

- CloudMailin (Incoming Emails)
- Brevo Transactional Email API (Outgoing Emails)

---

## Database

JSON-based Database

- orders.json
- customers.json
- products.json
- tickets.json
- email_logs.json
- conversations.json

---

## Backend Automation

- Ticket Creation
- Refund Requests
- Return Requests
- Investigation Requests
- Address Update Requests
- Coupon Requests
- GST Invoice Requests
- Order Tracking

---

## Business Logic

- Status Instructions
- Status Policies
- Company Policies
- Backend Action Validation
- Intent Validation
- Duplicate Email Detection
- Conversation Tracking

---

## Development Tools

- ngrok
- Ubuntu Linux
- Python Virtual Environment (venv)
- Git

---

#  Project Structure

```text
Email Automation/
│
├── backend.py
├── business_rules.py
├── database.py
├── llm_reply.py
├── sentiment.py
├── server.py
│
├── database/
│   ├── orders.json
│   ├── customers.json
│   ├── products.json
│   ├── tickets.json
│   ├── email_logs.json
│   └── conversations.json
│
├── NOTES.txt
└── README.md
```

---

# ⚙ Workflow

```text
Customer sends email
        │
        ▼
CloudMailin receives email
        │
        ▼
Flask Webhook receives POST request
        │
        ▼
Duplicate Email Detection
        │
        ▼
Sentiment Analysis
        │
        ▼
Extract Order ID
        │
        ▼
Load Customer + Product + Order
        │
        ▼
Generate AI Reply using Gemini
        │
        ▼
Validate JSON Response
        │
        ▼
Execute Backend Action
        │
        ▼
Update Database
        │
        ▼
Send Email using Brevo
        │
        ▼
Store Email Log
        │
        ▼
Store Conversation History
```

---

#  Backend Actions Supported

- NONE
- TRACK_ORDER
- CREATE_INVESTIGATION
- CREATE_REPLACEMENT_REQUEST
- CREATE_RETURN_REQUEST
- CREATE_REFUND_REQUEST
- CREATE_CANCELLATION_REQUEST
- UPDATE_DELIVERY_ADDRESS
- UPDATE_ORDER_ITEM
- GENERATE_GST_INVOICE
- APPLY_DISCOUNT_REQUEST

---

#  AI Capabilities

- Intent Detection
- Sentiment Analysis
- Context-aware Response Generation
- Business Rule Enforcement
- Human-like Email Generation
- JSON Structured Output
- Hallucination Prevention
- Retry Mechanism

---

#  Database Design

### Orders

Stores order information.

### Customers

Stores customer profile information.

### Products

Stores product catalog and policies.

### Tickets

Stores backend support tickets.

### Email Logs

Stores processed email history to prevent duplicate processing.

### Conversations

Stores complete customer support conversations.

---

# Error Handling

- Invalid Order ID Detection
- Missing Order ID Detection
- Invalid JSON Validation
- Gemini Retry Mechanism
- API Exception Handling
- Duplicate Email Detection
- Unknown Intent Validation
- Unknown Backend Action Validation

---

#  Future Improvements

- React Dashboard
- Admin Portal
- Authentication & Authorization
- PostgreSQL / MySQL Database
- Redis Queue
- Celery Background Workers
- Docker Support
- Kubernetes Deployment
- RabbitMQ / Kafka Event Streaming
- CRM Integration
- Analytics Dashboard
- Customer Support Metrics
- RAG-based Knowledge Base
- Multi-language Support
- Attachment Handling
- OCR for Invoice Processing
- Voice Support Integration

---

#  Libraries Used

```python
Flask
google-genai
sib-api-v3-sdk
transformers
torch
json
re
uuid
datetime
time
os
```

---

# Key Concepts Demonstrated

- Artificial Intelligence
- Prompt Engineering
- Email Automation
- REST APIs
- Webhooks
- Backend Automation
- Rule-Based Systems
- LLM Integration
- Sentiment Analysis
- CRUD Operations
- JSON Serialization
- Exception Handling
- Retry Mechanism
- Duplicate Request Handling (Idempotency)
- Conversation Tracking
- Modular Software Architecture

---
AI-Powered Customer Support Email Automation System built using Python, Flask, Google Gemini, DistilBERT, CloudMailin, and Brevo.
