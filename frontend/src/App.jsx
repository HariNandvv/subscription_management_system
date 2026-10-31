import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDashboard from "./pages/CustomerDashboard";
import Placeholder from "./pages/Placeholder";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import Discounts from "./pages/Discounts";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";

function ProtectedLayout() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = user.role === "admin";
  const isCustomer = user.role === "customer";

  if (!isAdmin && !isCustomer) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <Routes>
          <Route
            path="/dashboard"
            element={
              isAdmin ? <Dashboard /> : <CustomerDashboard />
            }
          />

          {/* Admin-only pages */}
          <Route
            path="/customers"
            element={
              isAdmin ? <Customers /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/plans"
            element={
              isAdmin ? <Plans /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/discounts"
            element={isAdmin ? <Discounts /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/products"
            element={
              isAdmin ? <Products /> : <Navigate to="/dashboard" replace />
            }
          />

          <Route
            path="/subscriptions"
            element={isAdmin ? <Subscriptions /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/invoices"
            element={isAdmin ? <Invoices /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/payments"
            element={isAdmin ? <Payments /> : <Navigate to="/dashboard" replace />}
          />

          {/* Customer-only pages */}
          <Route
            path="/my-subscriptions"
            element={
              isCustomer
                ? <Placeholder title="My Subscriptions" />
                : <Navigate to="/dashboard" replace />
            }
          />

          <Route
            path="/my-invoices"
            element={
              isCustomer
                ? <Placeholder title="My Invoices" />
                : <Navigate to="/dashboard" replace />
            }
          />

          <Route
            path="/my-payments"
            element={
              isCustomer
                ? <Placeholder title="My Payments" />
                : <Navigate to="/dashboard" replace />
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}