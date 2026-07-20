import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Tickets from "./pages/Tickets";
import Customers from "./pages/Customers";
import Emails from "./pages/Emails";
import Conversations from "./pages/Conversations";
import Products from "./pages/Products";
import TestEmail from "./pages/TestEmail";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/emails" element={<Emails />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/products" element={<Products />} />
                <Route path="/test-email" element={<TestEmail />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
