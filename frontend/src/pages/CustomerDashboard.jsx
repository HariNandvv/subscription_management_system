
import { useEffect, useState } from "react";
import api from "../services/api";

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [subRes, invoiceRes, paymentRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/invoices"),
        api.get("/payments")
      ]);

      setSubscriptions(subRes.data);
      setInvoices(invoiceRes.data);
      setPayments(paymentRes.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load account information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;

  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0), 0
  );

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(value);

  return (
    <div className="p-8 bg-[#f8f7fc] min-h-screen">
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {user?.name}!
      </h1>

      <p className="text-gray-500 mb-8">
        Manage your subscriptions and payments in one place.
      </p>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-xl border">
              <p className="text-gray-500">My Subscriptions</p>
              <h2 className="text-2xl font-bold mt-3">
                {subscriptions.length}
              </h2>
              <p className="text-green-600 text-sm mt-1">
                {activeCount} active
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <p className="text-gray-500">My Invoices</p>
              <h2 className="text-2xl font-bold mt-3">
                {invoices.length}
              </h2>
              <p className="text-purple-600 text-sm mt-1">
                Total invoices
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <p className="text-gray-500">Payment History</p>
              <h2 className="text-2xl font-bold mt-3">
                {payments.length}
              </h2>
              <p className="text-green-600 text-sm mt-1">
                {money(totalPaid)} paid
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border mt-8">
            <h2 className="font-semibold text-lg mb-4">
              Account Overview
            </h2>
            <p className="text-gray-600 mb-2">
              Name: {user?.name}
            </p>
            <p className="text-gray-600">
              Email: {user?.email}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
