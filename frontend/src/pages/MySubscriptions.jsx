
import { useEffect, useState } from "react";
import { Layers, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/subscriptions");
      setSubscriptions(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch subscriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const statusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Subscriptions
          </h1>
          <p className="text-gray-500 mt-1">
            View and manage your subscription details.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading subscriptions...</p>
      ) : error ? (
        <p className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </p>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border">
          <Layers size={35} className="mx-auto text-purple-500" />

          <h2 className="font-semibold text-gray-800 mt-4">
            No subscriptions yet
          </h2>

          <p className="text-gray-500 mt-2">
            Your subscriptions will appear here once they are created.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl border p-6"
            >
              <div className="flex justify-between items-start">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                  <Layers size={22} />
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle(sub.status)}`}
                >
                  {sub.status}
                </span>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mt-5">
                {sub.plan_name || "Subscription Plan"}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {sub.subscription_number || `SUB-${sub.id}`}
              </p>

              <h3 className="text-2xl font-bold text-purple-700 mt-4">
                ₹{Number(sub.plan_price || 0).toLocaleString("en-IN")}
              </h3>

              <div className="border-t mt-5 pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date</span>
                  <span className="text-gray-800">
                    {formatDate(sub.start_date)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Expiry Date</span>
                  <span className="text-gray-800">
                    {formatDate(sub.expiry_date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
