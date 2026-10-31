
import { useEffect, useState } from "react";
import { Layers, FileText, CreditCard } from "lucide-react";
import api from "../services/api";

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get("/subscriptions");
        setSubscriptions(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load subscriptions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const activeCount = subscriptions.filter(
    sub => sub.status === "active"
  ).length;

  const cards = [
    {
      title: "My Subscriptions",
      value: loading ? "Loading..." : subscriptions.length,
      description: `${activeCount} active`,
      icon: Layers,
    },
    {
      title: "My Invoices",
      value: "Coming soon",
      icon: FileText,
    },
    {
      title: "Payment History",
      value: "Coming soon",
      icon: CreditCard,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {user.name || "Customer"}!
      </h1>

      <p className="text-gray-500 mt-2">
        Manage your subscriptions and payments in one place.
      </p>

      {error && (
        <p className="bg-red-50 text-red-600 p-3 rounded-lg mt-5">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        {cards.map(({ title, value, description, icon: Icon }) => (
          <div
            key={title}
            className="bg-white p-6 rounded-xl border border-gray-100"
          >
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg w-fit">
              <Icon size={22} />
            </div>

            <p className="text-gray-500 mt-5">{title}</p>

            <h2 className="text-xl font-bold text-gray-800 mt-2">
              {value}
            </h2>

            {description && (
              <p className="text-sm text-green-600 mt-1">
                {description}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
        <h2 className="font-semibold text-gray-800">
          Account Overview
        </h2>

        <p className="text-gray-500 text-sm mt-4">
          Name: {user.name || "Not available"}
        </p>

        <p className="text-gray-500 text-sm mt-2">
          Email: {user.email || "Not available"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Recent Subscriptions
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading subscriptions...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-gray-400">
            You don't have any subscriptions yet.
          </p>
        ) : (
          <div className="space-y-4">
            {subscriptions.slice(0, 5).map(sub => (
              <div
                key={sub.id}
                className="flex justify-between items-center border-b last:border-0 pb-3"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {sub.plan_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sub.subscription_number || `SUB-${sub.id}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ₹{Number(sub.plan_price).toLocaleString("en-IN")}
                  </p>
                  <span className="text-xs text-purple-600 capitalize">
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
