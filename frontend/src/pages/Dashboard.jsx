import { useEffect, useState } from "react";
import {
  Users, Package, TrendingUp, Receipt, ArrowUpRight
} from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/users");

        const customers = res.data.filter(
          (user) => user.role === "customer"
        );

        setCustomerCount(customers.length);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load customer statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Customers",
      value: loading ? "..." : customerCount,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Active Subscriptions",
      value: "Coming soon",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Revenue",
      value: "Coming soon",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending Invoices",
      value: "Coming soon",
      icon: Receipt,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Monitor your subscription business.
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-5">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="bg-white rounded-xl p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">{title}</p>
              <div className={`${color} p-2 rounded-lg`}>
                <Icon size={20} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-5">
              {value}
            </h2>

            {title === "Total Customers" && !loading && !error && (
              <p className="text-sm text-green-600 mt-3">
                Registered customer accounts
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-8">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800">Revenue Overview</h2>
          <p className="text-sm text-gray-400 mt-1">
            Revenue analytics will be connected to payment data.
          </p>

          <div className="h-64 flex items-center justify-center text-gray-400">
            Revenue chart coming soon
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800">Quick Overview</h2>
          <div className="py-12 text-center text-gray-400 text-sm">
            Payment statistics will appear here.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
        <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        <div className="py-12 text-center text-gray-400">
          Recent subscription activity will appear here.
        </div>
      </div>
    </div>
  );
}