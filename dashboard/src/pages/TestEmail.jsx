import { useState } from "react";
import { sendTestEmail } from "../api";
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestEmail() {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await sendTestEmail({ senderEmail, subject, body });
      if (res.ok) {
        setStatus({ type: "success", message: `Email processed successfully (${res.status})` });
        setSenderEmail("");
        setSubject("");
        setBody("");
      } else {
        setStatus({ type: "error", message: `Server returned ${res.status}: ${res.text}` });
      }
    } catch (err) {
      setStatus({ type: "error", message: `Network error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Send Test Email</h2>
        <p>Simulate an incoming customer email to test order matching and AI reply end-to-end</p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Sender Email</label>
            <input
              type="email"
              required
              placeholder="customer@example.com"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Where is my order ORD635241?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Message Body</label>
            <textarea
              required
              rows={8}
              placeholder={"Dear Support,\n\nI'd like to check the status of my order ORD635241.\n\nThanks"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Test Email
              </>
            )}
          </button>
        </form>

        {status && (
          <div style={{
            ...styles.feedback,
            ...(status.type === "success" ? styles.success : styles.error),
          }}>
            {status.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {status.message}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "28px 32px",
    maxWidth: "640px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.15s",
  },
  textarea: {
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    alignSelf: "flex-start",
    transition: "background 0.15s",
  },
  feedback: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    marginTop: "16px",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
};
