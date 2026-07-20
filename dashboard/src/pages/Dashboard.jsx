import { useCallback } from "react";
import { fetchDashboard, fetchOrders, fetchTickets, fetchEmails, fetchProducts, fetchCustomers, fetchConversations } from "../api";
import usePolling from "../hooks/usePolling";
import {
  ShoppingCart,
  Users,
  Ticket,
  Mail,
  Package,
  MessageSquare,
  Activity,
} from "lucide-react";
import "./Dashboard.css";

const STATUS_COLORS = {
  Delivered: "#10b981",
  Processing: "#6366f1",
  "In Transit": "#f59e0b",
  "Out for Delivery": "#06b6d4",
  Delayed: "#ef4444",
  Cancelled: "#6b7280",
  Returned: "#ec4899",
  Refunded: "#8b5cf6",
  Open: "#6366f1",
  Pending: "#f59e0b",
  Resolved: "#10b981",
  Closed: "#6b7280",
};

const BAR_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#ef4444"];

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + "15", color }}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

function DonutChart({ data, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 55;
  const stroke = 28;

  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const dash = 2 * Math.PI * r * pct;
    const gap = 2 * Math.PI * r - dash;
    const offset = -2 * Math.PI * r * (cumulative / total) + (2 * Math.PI * r) / 4;
    cumulative += d.value;
    return (
      <circle
        key={d.name}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={colors[i % colors.length]}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    );
  });

  return (
    <div className="donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments}
      </svg>
      <div className="donut-center">
        <span className="donut-total">{total}</span>
        <span className="donut-label">Total</span>
      </div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={d.name} className="legend-item">
            <span className="legend-dot" style={{ background: colors[i % colors.length] }} />
            <span className="legend-name">{d.name}</span>
            <span className="legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, colors }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={d.name} className="bar-row">
          <span className="bar-label">{d.name}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: colors[i % colors.length],
              }}
            />
            <span className="bar-value">{d.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function countBy(list, key) {
  const counts = {};
  for (const item of list) {
    const val = item[key] || "Unknown";
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

export default function Dashboard() {
  const getData = useCallback(async () => {
    const [, orders, tickets, emails, products, customers, conversations] = await Promise.all([
      fetchDashboard(),
      fetchOrders(),
      fetchTickets(),
      fetchEmails(),
      fetchProducts(),
      fetchCustomers(),
      fetchConversations(),
    ]);
    return {
      total_orders: orders.length,
      total_customers: customers.length,
      total_tickets: tickets.length,
      total_emails: emails.length,
      total_products: products.length,
      total_conversations: conversations.length,
      order_statuses: countBy(orders, "status"),
      ticket_statuses: countBy(tickets, "status"),
      ticket_types: countBy(tickets, "type"),
      action_counts: countBy(emails, "backend_action"),
    };
  }, []);
  const { data, loading } = usePolling(getData, 5000);

  if (loading || !data) return <div className="loading">Loading...</div>;

  const orderPieData = Object.entries(data.order_statuses).map(([name, value]) => ({ name, value }));
  const ticketPieData = Object.entries(data.ticket_statuses).map(([name, value]) => ({ name, value }));
  const actionBarData = Object.entries(data.action_counts)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
    }))
    .sort((a, b) => b.value - a.value);
  const ticketTypeData = Object.entries(data.ticket_types).map(([name, value]) => ({ name, value }));

  const orderColors = orderPieData.map((d) => STATUS_COLORS[d.name] || "#94a3b8");
  const ticketColors = ticketPieData.map((d) => STATUS_COLORS[d.name] || "#94a3b8");

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Real-time insights for Elemental Concept Email Automation</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Orders" value={data.total_orders} icon={ShoppingCart} color="#6366f1" sub={`${Object.keys(data.order_statuses).length} statuses`} />
        <StatCard label="Total Customers" value={data.total_customers} icon={Users} color="#06b6d4" sub={`${data.total_conversations} conversations`} />
        <StatCard label="Total Tickets" value={data.total_tickets} icon={Ticket} color="#f59e0b" sub={`${Object.keys(data.ticket_types).length} types`} />
        <StatCard label="Emails Processed" value={data.total_emails} icon={Mail} color="#10b981" sub={`${Object.keys(data.action_counts).length} action types`} />
        <StatCard label="Products" value={data.total_products} icon={Package} color="#ec4899" />
        <StatCard label="Conversations" value={data.total_conversations} icon={MessageSquare} color="#8b5cf6" />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Order Status Distribution</h3>
            <span className="chart-badge">{orderPieData.length} statuses</span>
          </div>
          <DonutChart data={orderPieData} colors={orderColors} />
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Ticket Status Distribution</h3>
            <span className="chart-badge">{data.total_tickets} total</span>
          </div>
          <DonutChart data={ticketPieData} colors={ticketColors} />
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Backend Actions Triggered</h3>
            <span className="chart-badge">{actionBarData.length} types</span>
          </div>
          <BarChart data={actionBarData} colors={BAR_COLORS} />
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Ticket Types Breakdown</h3>
            <span className="chart-badge">{ticketTypeData.length} types</span>
          </div>
          <BarChart data={ticketTypeData} colors={BAR_COLORS} />
        </div>
      </div>

      <div className="summary-card">
        <Activity size={18} />
        <h4>System Health</h4>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-value">{data.total_emails}</span>
            <span className="summary-label">Emails processed</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{data.total_orders}</span>
            <span className="summary-label">Total orders</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{data.total_tickets}</span>
            <span className="summary-label">Open tickets</span>
          </div>
        </div>
      </div>
    </div>
  );
}
