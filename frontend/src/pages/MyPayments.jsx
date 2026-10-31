
import { useEffect, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2
    })}`;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Payments</h1>
          <p className="text-gray-500 mt-1">
            View your payment history.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading payments...</p>
      ) : error ? (
        <p className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</p>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border">
          <CreditCard size={35} className="mx-auto text-purple-500" />
          <h2 className="font-semibold text-gray-800 mt-4">
            No payments yet
          </h2>
          <p className="text-gray-500 mt-2">
            Your payment history will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Invoice</th>
                <th className="p-4">Date</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t text-sm">
                  <td className="p-4 font-medium text-gray-800">
                    #{payment.id}
                  </td>
                  <td className="p-4 text-purple-600">
                    {payment.invoice_number || `Invoice #${payment.invoice_id}`}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(payment.payment_date)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {payment.payment_method || "-"}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">
                    {formatAmount(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
