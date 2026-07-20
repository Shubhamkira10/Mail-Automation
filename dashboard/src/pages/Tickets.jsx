import { useCallback, useState } from "react";
import { fetchTickets } from "../api";
import usePolling from "../hooks/usePolling";
import { Search } from "lucide-react";
import "./TablePages.css";

export default function Tickets() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const getData = useCallback(() => fetchTickets(), []);
  const { data: tickets, loading } = usePolling(getData, 5000);

  if (loading || !tickets) return <div className="loading">Loading...</div>;

  const statuses = ["All", ...new Set(tickets.map((t) => t.status))];
  const q = search.toLowerCase();
  const filtered = tickets
    .filter((t) => filter === "All" || t.status === filter)
    .filter(
      (t) =>
        !q ||
        t.ticket_id?.toLowerCase().includes(q) ||
        t.order_id?.toLowerCase().includes(q) ||
        t.customer_name?.toLowerCase().includes(q) ||
        t.customer_email?.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q)
    );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Tickets</h2>
        <p>Manage support and investigation tickets</p>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by ticket ID, order ID, customer, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        {statuses.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.ticket_id}>
                <td className="mono">{t.ticket_id}</td>
                <td className="mono">{t.order_id}</td>
                <td>
                  <div>{t.customer_name}</div>
                  <div className="sub-text">{t.customer_email}</div>
                </td>
                <td>
                  <span className={`badge badge-type`}>{t.type}</span>
                </td>
                <td>
                  <span className={`badge badge-${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>
                </td>
                <td>{t.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
