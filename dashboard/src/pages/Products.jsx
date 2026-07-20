import { useCallback, useState } from "react";
import { fetchProducts } from "../api";
import usePolling from "../hooks/usePolling";
import { CheckCircle, XCircle, Search } from "lucide-react";
import "./TablePages.css";

export default function Products() {
  const [search, setSearch] = useState("");
  const getData = useCallback(() => fetchProducts(), []);
  const { data: products = [], loading } = usePolling(getData, 5000);

  function BoolIcon({ val }) {
    return val ? (
      <CheckCircle size={16} color="#10b981" />
    ) : (
      <XCircle size={16} color="#ef4444" />
    );
  }

  if (loading) return <div className="loading">Loading...</div>;

  const q = search.toLowerCase();
  const filtered = products.filter(
    (p) =>
      !q ||
      p.product_id?.toLowerCase().includes(q) ||
      p.product_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Products</h2>
        <p>Product catalog and policy information</p>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by product name, ID, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Replacement</th>
              <th>Return</th>
              <th>Refund</th>
              <th>Warranty</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.product_id}>
                <td className="mono">{p.product_id}</td>
                <td className="name-cell">{p.product_name}</td>
                <td>
                  <span className="badge badge-category">{p.category}</span>
                </td>
                <td className="bool-cell">
                  <BoolIcon val={p.replacement_allowed} />
                  {p.replacement_allowed && (
                    <span className="sub-text">{p.replacement_window_days}d</span>
                  )}
                </td>
                <td className="bool-cell">
                  <BoolIcon val={p.return_allowed} />
                  {p.return_allowed && (
                    <span className="sub-text">{p.return_window_days}d</span>
                  )}
                </td>
                <td className="bool-cell">
                  <BoolIcon val={p.refund_allowed} />
                  {p.refund_allowed && (
                    <span className="sub-text">{p.refund_window_days}d</span>
                  )}
                </td>
                <td>{p.warranty_months > 0 ? `${p.warranty_months}mo` : "-"}</td>
                <td>
                  <span className="count-badge">{p.order_count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
