const API_BASE = (import.meta.env.VITE_API_BASE_URL || "") + "/api";

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  return res.json();
}

export async function fetchOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  return res.json();
}

export async function fetchTickets() {
  const res = await fetch(`${API_BASE}/tickets`);
  return res.json();
}

export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/customers`);
  return res.json();
}

export async function fetchCustomer(customerId) {
  const res = await fetch(`${API_BASE}/customers/${customerId}`);
  return res.json();
}

export async function fetchEmails() {
  const res = await fetch(`${API_BASE}/emails`);
  return res.json();
}

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  return res.json();
}

export async function fetchConversation(orderId) {
  const res = await fetch(`${API_BASE}/conversations/${orderId}`);
  return res.json();
}

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

const EMAIL_ENDPOINT = (import.meta.env.VITE_API_BASE_URL || "") + "/email";

export async function sendTestEmail({ senderEmail, subject, body }) {
  const payload = {
    envelope: { from: senderEmail },
    headers: { subject },
    plain: body,
  };
  const res = await fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}
