
import { useEffect, useState } from "react";
import {
  Users, Package, Repeat, IndianRupee,
  FileText, AlertTriangle, RefreshCw
} from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    users: [],
    products: [],
    subscriptions: [],
    invoices: [],
    payments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [users, products, subscriptions, invoices, payments] =
        await Promise.all([
          api.get("/users"),
          api.get("/products"),
          api.get("/subscriptions"),
          api.get("/invoices"),
          api.get("/payments"),
        ]);

      setData({
        users: users.data,
        products: products.data,
        subscriptions: subscriptions.data,
        invoices: invoices.data,
        payments: payments.data,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const customers = data.users.filter(u => u.role === "customer").length;

  const activeSubscriptions = data.subscriptions.filter(
    s => s.status === "active"
  ).length;

  const totalRevenue = data.payments.reduce(
    (sum, p) => sum + Number(p.amount || 0), 0
  );

  const paidByInvoice = {};
  data.payments.forEach(payment => {
    paidByInvoice[payment.invoice_id] =
      (paidByInvoice[payment.invoice_id] || 0) +
      Number(payment.amount || 0);
  });

  const outstandingInvoices = data.invoices.filter(invoice => {
    if (["paid", "cancelled"].includes(invoice.status)) return false;

    const remaining =
      Number(invoice.total || 0) -
      (paidByInvoice[invoice.id] || 0);

    return remaining > 0;
  });

  const overdueInvoices = outstandingInvoices.filter(invoice =>
    invoice.due_date &&
    new Date(invoice.due_date).getTime() < new Date().setHours(0, 0, 0, 0)
  );

  const outstandingAmount = outstandingInvoices.reduce((sum, invoice) => {
    return sum + Math.max(
      0,
      Number(invoice.total || 0) -
      (paidByInvoice[invoice.id] || 0)
    );
  }, 0);

  const stats = [
    {
      title: "Total Customers",
      value: customers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Products",
      value: data.products.length,
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions,
      icon: Repeat,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Revenue Received",
      value: `₹${totalRevenue.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: IndianRupee,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Outstanding Amount",
      value: `₹${outstandingAmount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: FileText,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Overdue Invoices",
      value: overdueInvoices.length,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
  ];

  if (loading) {
    return <p className="p-6 text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of your subscription business
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 border bg-white px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.title}
              className="bg-white border rounded-xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Recent Payments
          </h2>

          {data.payments.length === 0 ? (
            <p className="text-gray-400 text-sm">No payments recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {data.payments.slice(0, 5).map(payment => (
                <div key={payment.id}
                  className="flex justify-between items-center border-b last:border-0 pb-3">
                  <div>
                    <p className="font-medium text-gray-700">
                      Payment #{payment.id}
                    </p>
                    <p className="text-xs text-gray-400">
                      Invoice #{payment.invoice_id}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {payment.payment_date?.slice(0, 10) || "Date unavailable"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Overdue Invoices
          </h2>

          {overdueInvoices.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No overdue invoices.
            </p>
          ) : (
            <div className="space-y-4">
              {overdueInvoices.slice(0, 5).map(invoice => {
                const remaining =
                  Number(invoice.total || 0) -
                  (paidByInvoice[invoice.id] || 0);

                return (
                  <div key={invoice.id}
                    className="flex justify-between items-center border-b last:border-0 pb-3">
                    <div>
                      <p className="font-medium text-gray-700">
                        {invoice.invoice_number || `Invoice #${invoice.id}`}
                      </p>
                      <p className="text-xs text-red-500">
                        Due: {invoice.due_date?.slice(0, 10)}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-800">
                      ₹{remaining.toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
