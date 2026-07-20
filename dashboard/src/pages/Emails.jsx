import { useCallback } from "react";
import { fetchEmails } from "../api";
import usePolling from "../hooks/usePolling";
import "./TablePages.css";

export default function Emails() {
  const getData = useCallback(() => fetchEmails(), []);
  const { data: emails = [], loading } = usePolling(getData, 5000);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Email Logs</h2>
        <p>All processed customer emails and their outcomes</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Message ID</th>
              <th>Customer Email</th>
              <th>Order ID</th>
              <th>Backend Action</th>
              <th>Status</th>
              <th>Processed At</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((e, i) => (
              <tr key={i}>
                <td className="mono message-id-cell">
                  {e.message_id?.substring(0, 30)}...
                </td>
                <td>{e.customer_email}</td>
                <td className="mono">{e.order_id}</td>
                <td>
                  <span
                    className={`badge ${
                      e.backend_action === "NONE" ? "badge-none" : "badge-action"
                    }`}
                  >
                    {e.backend_action}
                  </span>
                </td>
                <td>
                  <span className="badge badge-processed">{e.status}</span>
                </td>
                <td>{e.processed_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
