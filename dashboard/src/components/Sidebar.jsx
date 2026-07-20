import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Ticket,
  Users,
  Mail,
  MessageSquare,
  Package,
  Send,
} from "lucide-react";
import "./Sidebar.css";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/emails", label: "Email Logs", icon: Mail },
  { to: "/conversations", label: "Conversations", icon: MessageSquare },
  { to: "/products", label: "Products", icon: Package },
  { to: "/test-email", label: "Test Email", icon: Send },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">E</span>
        <div>
          <h1>Elemental Concept</h1>
          <p>Email Automation</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
