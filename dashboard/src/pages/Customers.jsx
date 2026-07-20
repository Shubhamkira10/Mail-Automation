import { useCallback, useState } from "react";
import { fetchCustomers } from "../api";
import usePolling from "../hooks/usePolling";
import { Search } from "lucide-react";
import "./TablePages.css";

export default function Customers() {
  const [search, setSearch] = useState("");
  const getData = useCallback(() => fetchCustomers(), []);
  const { data: customers = [], loading } = usePolling(getData, 5000);

  if (loading) return <div className="loading">Loading...</div>;

  const q = search.toLowerCase();
  const filtered = customers.filter(
    (c) =>
      !q ||
      c.customer_id?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Customers</h2>
        <p>All registered customers and their activity</p>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by name, email, customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Tickets</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.customer_id}>
                <td className="mono">{c.customer_id}</td>
                <td className="name-cell">{c.name}</td>
                <td>{c.email}</td>
                <td className="mono">{c.phone}</td>
                <td>
                  <span className="count-badge">{c.order_count}</span>
                </td>
                <td>
                  <span className="count-badge">{c.ticket_count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
