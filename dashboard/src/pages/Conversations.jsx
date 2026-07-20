import { useCallback, useState, useMemo } from "react";
import { fetchConversations } from "../api";
import usePolling from "../hooks/usePolling";
import { MessageSquare, ChevronRight, User, Bot, AlertTriangle } from "lucide-react";
import "./Conversations.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "linked", label: "Order-linked" },
  { key: "unmatched", label: "Unmatched" },
];

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts.replace(" ", "T"));
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function groupMessages(messages) {
  const groups = [];
  let lastDate = null;
  let lastDirection = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const date = formatDate(msg.timestamp);

    if (date !== lastDate) {
      groups.push({ type: "date", date, key: `date-${date}-${i}` });
      lastDate = date;
      lastDirection = null;
    }

    const isGrouped = msg.direction === lastDirection;
    groups.push({ type: "message", message: msg, grouped: isGrouped, key: `${msg.direction}-${msg.sender}-${msg.timestamp}-${i}` });
    lastDirection = msg.direction;
  }

  return groups;
}

export default function Conversations() {
  const getData = useCallback(() => fetchConversations(), []);
  const { data: conversations = [], loading } = usePolling(getData, 5000);
  console.log("API conversations:", conversations);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const enriched = useMemo(() =>
    (conversations || []).map((c) => ({
      ...c,
      message_count: c.message_count ?? (c.messages ? c.messages.length : 0),
      order_status: c.order_status || "Unknown",
      is_matched: !!c.order_id,
      customer_name: c.customer_name || "Unknown",
      customer_email: c.customer_email || "",
    })),
    [conversations]
  );

  const filtered = useMemo(() => {
    if (filter === "linked") return enriched.filter((c) => c.is_matched);
    if (filter === "unmatched") return enriched.filter((c) => !c.is_matched);
    return enriched;
  }, [enriched, filter]);

  const counts = useMemo(() => ({
    all: enriched.length,
    linked: enriched.filter((c) => c.is_matched).length,
    unmatched: enriched.filter((c) => !c.is_matched).length,
  }), [enriched]);

  const selectedConv = useMemo(() => {
    if (!selected) return null;
    return enriched.find((c) => c.conversation_id === selected.conversation_id) || null;
  }, [selected, enriched]);

  const selectedMessages = useMemo(() => {
    console.log("Selected conversation", selectedConv);
    console.log("Selected messages", selectedConv?.messages);
    return selectedConv ? selectedConv.messages || [] : [];
  }, [selectedConv]);

  const grouped = useMemo(() => groupMessages(selectedMessages), [selectedMessages]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Conversations</h2>
        <p>View full conversation threads per order</p>
      </div>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="filter-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="conv-layout">
        <div className="conv-list">
          {filtered.length === 0 && (
            <div className="conv-list-empty">
              <MessageSquare size={24} strokeWidth={1.5} />
              <p>No conversations found</p>
            </div>
          )}
          {filtered.map((c) => (
            <div
              key={c.conversation_id}
              className={`conv-item ${selected?.conversation_id === c.conversation_id ? "active" : ""}`}
              onClick={() => setSelected(c)}
            >
              <div className={`conv-item-icon ${!c.is_matched ? "unmatched" : ""}`}>
                {c.is_matched ? <MessageSquare size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="conv-item-info">
                <div className="conv-item-header">
                  <span className="conv-order-id">
                    {c.order_id || "No Order ID"}
                  </span>
                  <span className={`badge badge-${c.order_status?.toLowerCase().replace(/\s/g, "-") || "unknown"}`}>
                    {c.order_status}
                  </span>
                </div>
                <div className="conv-item-meta">
                  <span className="conv-customer-name">{c.customer_name}</span>
                  <span className="conv-sep">&middot;</span>
                  <span>{c.message_count} message{c.message_count !== 1 ? "s" : ""}</span>
                  {!c.is_matched && <span className="unmatched-badge">Unmatched</span>}
                  <ChevronRight size={14} className="conv-chevron" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="conv-messages">
          {selectedConv ? (
            <>
              <div className="conv-messages-header">
                <div className="conv-header-info">
                  <div className="conv-header-avatar">
                    <User size={18} />
                  </div>
                  <div>
                    <h3>{selectedConv.customer_name || "Unknown"}</h3>
                    <span className="conv-header-order">
                      {selectedConv.order_id || "No Order ID"}
                      {!selectedConv.is_matched && (
                        <span className="unmatched-badge">Unmatched</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="conv-header-right">
                  <span className={`badge badge-${selectedConv.order_status?.toLowerCase().replace(/\s/g, "-") || "unknown"}`}>
                    {selectedConv.order_status || "Unknown"}
                  </span>
                  <span className="conv-header-count">
                    {selectedMessages.length} message{selectedMessages.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="messages-list">
                {grouped.map((item) => {
                  if (item.type === "date") {
                    return (
                      <div key={item.key} className="date-divider">
                        <span>{item.date}</span>
                      </div>
                    );
                  }
                  const m = item.message;
                  const isCustomer = m.direction === "incoming";

                  if (item.grouped) {
                    return (
                      <div key={item.key} className={`message-bubble message-${m.direction} grouped`}>
                        {m.subject && <div className="message-subject">{m.subject}</div>}
                        <div className="message-body">{m.body}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={item.key} className={`message-bubble message-${m.direction}`}>
                      <div className="message-header">
                        <div className={`message-avatar ${m.direction}`}>
                          {isCustomer ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <span className="message-sender">
                          {isCustomer ? (selectedConv.customer_name || "Customer") : "Elemental Concept"}
                        </span>
                        <span className="message-time">{m.timestamp?.split(" ")[1] || ""}</span>
                      </div>
                      {m.subject && <div className="message-subject">{m.subject}</div>}
                      <div className="message-body">{m.body}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="conv-empty">
              <MessageSquare size={48} strokeWidth={1} />
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
