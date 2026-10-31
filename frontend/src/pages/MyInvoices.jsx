
import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2
    })}`;

  const statusStyle = (status) => {
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "overdue") return "bg-red-100 text-red-700";
    if (status === "cancelled") return "bg-gray-100 text-gray-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Invoices</h1>
          <p className="text-gray-500 mt-1">
            View your billing history and invoice details.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading invoices...</p>
      ) : error ? (
        <p className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</p>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border">
          <FileText size={35} className="mx-auto text-purple-500" />
          <h2 className="font-semibold text-gray-800 mt-4">
            No invoices yet
          </h2>
          <p className="text-gray-500 mt-2">
            Your invoices will appear here when they are created.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t text-sm">
                  <td className="p-4 font-medium text-gray-800">
                    {invoice.invoice_number || `INV-${invoice.id}`}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(invoice.created_at)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">
                    {formatAmount(invoice.total)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(invoice.status)}`}>
                      {invoice.status || "Unknown"}
                    </span>
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
