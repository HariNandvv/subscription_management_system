
import { useEffect, useState } from "react";
import { Plus, Search, Eye, Trash2, X } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  invoice_id: "",
  payment_method: "UPI",
  amount: "",
  payment_date: "",
  note: "",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [paymentRes, invoiceRes] = await Promise.all([
        api.get("/payments"),
        api.get("/invoices"),
      ]);

      setPayments(paymentRes.data);
      setInvoices(invoiceRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/payments", {
        ...form,
        invoice_id: Number(form.invoice_id),
        amount: Number(form.amount),
        payment_date: form.payment_date || null,
      });

      setShowForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payment");
    }
  };

  const viewPayment = async (id) => {
    try {
      const res = await api.get(`/payments/${id}`);
      setSelected(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payment");
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await api.delete(`/payments/${id}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete payment");
    }
  };

  const filtered = payments.filter(payment =>
    `${payment.id} ${payment.invoice_id} ${payment.payment_method || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage invoice payments
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg"
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</p>
      )}

      <div className="bg-white p-4 rounded-xl border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search payments..."
            className="w-full border rounded-lg pl-10 pr-3 py-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500">Loading payments...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Payment ID", "Invoice ID", "Method", "Amount", "Payment Date", "Actions"].map(h =>
                  <th key={h} className="p-4 font-medium">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => (
                <tr key={payment.id} className="border-t">
                  <td className="p-4 font-medium">PAY-{payment.id}</td>
                  <td className="p-4">{payment.invoice_id}</td>
                  <td className="p-4">{payment.payment_method || "-"}</td>
                  <td className="p-4">₹{Number(payment.amount).toFixed(2)}</td>
                  <td className="p-4">
                    {payment.payment_date?.slice(0, 10) || "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button onClick={() => viewPayment(payment.id)}
                        className="text-purple-600">
                        <Eye size={17} />
                      </button>
                      <button onClick={() => deletePayment(payment.id)}
                        className="text-red-500">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Record Payment</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">Invoice</label>
              <select required value={form.invoice_id}
                onChange={e => setForm({...form, invoice_id: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1">
                <option value="">Select invoice</option>
                {invoices.filter(i => i.status !== "cancelled").map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number || `INV-${invoice.id}`} — ₹{invoice.total}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <select value={form.payment_method}
                onChange={e => setForm({...form, payment_method: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1">
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <input required type="number" min="0.01" step="0.01"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium">Payment Date</label>
              <input type="date" value={form.payment_date}
                onChange={e => setForm({...form, payment_date: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium">Note</label>
              <textarea value={form.note}
                onChange={e => setForm({...form, note: e.target.value})}
                placeholder="Optional payment note"
                className="w-full border rounded-lg p-3 mt-1" />
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">
              Save Payment
            </button>
          </form>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>

            <p><b>Payment ID:</b> PAY-{selected.id}</p>
            <p><b>Invoice ID:</b> {selected.invoice_id}</p>
            <p><b>Method:</b> {selected.payment_method || "-"}</p>
            <p><b>Amount:</b> ₹{Number(selected.amount).toFixed(2)}</p>
            <p><b>Date:</b> {selected.payment_date?.slice(0, 10) || "-"}</p>
            <p><b>Note:</b> {selected.note || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
