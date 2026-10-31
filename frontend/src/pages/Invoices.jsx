
import { useEffect, useState } from "react";
import { Plus, Search, Eye, X, Trash2 } from "lucide-react";
import api from "../services/api";

const emptyItem = {
  product_id: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    invoice_number: "",
    subscription_id: "",
    customer_id: "",
    billing_period_start: "",
    billing_period_end: "",
    tax_amount: 0,
    discount_amount: 0,
    due_date: "",
    items: [{ ...emptyItem }],
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceRes, userRes, subRes, productRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/users"),
        api.get("/subscriptions"),
        api.get("/products"),
      ]);

      setInvoices(invoiceRes.data);
      setCustomers(userRes.data.filter(u => u.role === "customer"));
      setSubscriptions(subRes.data);
      setProducts(productRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const subtotal = form.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  const total =
    subtotal +
    Number(form.tax_amount || 0) -
    Number(form.discount_amount || 0);

  const updateItem = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleProductChange = (index, productId) => {
    const product = products.find(p => String(p.id) === productId);

    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              product_id: productId,
              description: product?.name || item.description,
              unit_price: product?.sale_price ?? item.unit_price,
            }
          : item
      ),
    }));
  };

  const handleSubscriptionChange = (id) => {
    const sub = subscriptions.find(s => String(s.id) === id);

    setForm(prev => ({
      ...prev,
      subscription_id: id,
      customer_id: sub ? String(sub.customer_id) : "",
    }));
  };

  const resetForm = () => {
    setForm({
      invoice_number: "",
      subscription_id: "",
      customer_id: "",
      billing_period_start: "",
      billing_period_end: "",
      tax_amount: 0,
      discount_amount: 0,
      due_date: "",
      items: [{ ...emptyItem }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = {
      ...form,
      subscription_id: Number(form.subscription_id),
      customer_id: Number(form.customer_id),
      tax_amount: Number(form.tax_amount || 0),
      discount_amount: Number(form.discount_amount || 0),
      billing_period_start: form.billing_period_start || null,
      billing_period_end: form.billing_period_end || null,
      due_date: form.due_date || null,
      items: form.items.map(item => ({
        product_id: item.product_id ? Number(item.product_id) : null,
        description: item.description || null,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_rate: Number(item.tax_rate || 0),
      })),
    };

    try {
      await api.post("/invoices", data);
      setShowForm(false);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice");
    }
  };

  const viewInvoice = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setSelected(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoice");
    }
  };

  const filtered = invoices.filter(invoice =>
    `${invoice.invoice_number || ""} ${invoice.customer_id} ${invoice.status || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage customer invoices
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg"
        >
          <Plus size={18} /> Create Invoice
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
            placeholder="Search invoices..."
            className="w-full border rounded-lg pl-10 pr-3 py-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500">Loading invoices...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Invoice", "Customer ID", "Subscription", "Total", "Due Date", "Status", "Action"].map(h =>
                  <th key={h} className="p-4 font-medium">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(invoice => (
                <tr key={invoice.id} className="border-t">
                  <td className="p-4 font-medium">
                    {invoice.invoice_number || `INV-${invoice.id}`}
                  </td>
                  <td className="p-4">{invoice.customer_id}</td>
                  <td className="p-4">{invoice.subscription_id}</td>
                  <td className="p-4">₹{Number(invoice.total).toFixed(2)}</td>
                  <td className="p-4">
                    {invoice.due_date?.slice(0, 10) || "-"}
                  </td>
                  <td className="p-4 capitalize">{invoice.status}</td>
                  <td className="p-4">
                    <button
                      onClick={() => viewInvoice(invoice.id)}
                      className="text-purple-600"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Invoice</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">Invoice Number</label>
              <input
                value={form.invoice_number}
                onChange={e => setForm({...form, invoice_number: e.target.value})}
                placeholder="Optional"
                className="w-full border rounded-lg p-3 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subscription</label>
              <select
                required
                value={form.subscription_id}
                onChange={e => handleSubscriptionChange(e.target.value)}
                className="w-full border rounded-lg p-3 mt-1"
              >
                <option value="">Select subscription</option>
                {subscriptions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.subscription_number || `SUB-${s.id}`} - {s.plan_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Customer</label>
              <select
                required
                value={form.customer_id}
                onChange={e => setForm({...form, customer_id: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1"
              >
                <option value="">Select customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Billing Start</label>
                <input type="date" value={form.billing_period_start}
                  onChange={e => setForm({...form, billing_period_start: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Billing End</label>
                <input type="date" value={form.billing_period_end}
                  onChange={e => setForm({...form, billing_period_end: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="font-semibold">Invoice Items</label>
                <button type="button" onClick={addItem}
                  className="text-purple-600 text-sm font-medium">
                  + Add Item
                </button>
              </div>

              {form.items.map((item, index) => (
                <div key={index} className="border rounded-xl p-3 mt-3 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Item {index + 1}</span>
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)}
                        className="text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <select
                    value={item.product_id}
                    onChange={e => handleProductChange(index, e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Custom item (no product)</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <input
                    required
                    value={item.description}
                    onChange={e => updateItem(index, "description", e.target.value)}
                    placeholder="Description"
                    className="w-full border rounded-lg p-2"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <input required type="number" min="1" step="1"
                      value={item.quantity}
                      onChange={e => updateItem(index, "quantity", e.target.value)}
                      placeholder="Quantity" className="border rounded-lg p-2 min-w-0" />

                    <input required type="number" min="0" step="0.01"
                      value={item.unit_price}
                      onChange={e => updateItem(index, "unit_price", e.target.value)}
                      placeholder="Unit price" className="border rounded-lg p-2 min-w-0" />

                    <input type="number" min="0" step="0.01"
                      value={item.tax_rate}
                      onChange={e => updateItem(index, "tax_rate", e.target.value)}
                      placeholder="Tax rate %" className="border rounded-lg p-2 min-w-0" />
                  </div>

                  <p className="text-right text-sm text-gray-500">
                    Amount: ₹{(
                      Number(item.quantity || 0) *
                      Number(item.unit_price || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tax Amount (₹)</label>
                <input type="number" min="0" step="0.01"
                  value={form.tax_amount}
                  onChange={e => setForm({...form, tax_amount: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Amount (₹)</label>
                <input type="number" min="0" step="0.01"
                  value={form.discount_amount}
                  onChange={e => setForm({...form, discount_amount: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Due Date</label>
              <input type="date" value={form.due_date}
                onChange={e => setForm({...form, due_date: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1" />
            </div>

            <div className="bg-purple-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span><span>₹{Number(form.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span><span>- ₹{Number(form.discount_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={total < 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-lg font-semibold"
            >
              Create Invoice
            </button>
          </form>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Invoice Details</h2>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>

            <div className="space-y-2 text-sm">
              <p><b>Invoice:</b> {selected.invoice_number || `INV-${selected.id}`}</p>
              <p><b>Customer ID:</b> {selected.customer_id}</p>
              <p><b>Subscription ID:</b> {selected.subscription_id}</p>
              <p><b>Status:</b> {selected.status}</p>
              <p><b>Due Date:</b> {selected.due_date?.slice(0, 10) || "-"}</p>
            </div>

            <h3 className="font-semibold mt-5 mb-2">Items</h3>
            <div className="border rounded-lg divide-y">
              {selected.items?.map(item => (
                <div key={item.id} className="p-3 flex justify-between text-sm gap-3">
                  <div>
                    <p className="font-medium">{item.description || "Item"}</p>
                    <p className="text-gray-500">
                      {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <span>₹{Number(item.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex justify-between"><span>Subtotal</span><b>₹{Number(selected.subtotal).toFixed(2)}</b></p>
              <p className="flex justify-between"><span>Tax</span><b>₹{Number(selected.tax_amount).toFixed(2)}</b></p>
              <p className="flex justify-between"><span>Discount</span><b>₹{Number(selected.discount_amount).toFixed(2)}</b></p>
              <p className="flex justify-between border-t pt-3 text-lg"><b>Total</b><b>₹{Number(selected.total).toFixed(2)}</b></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
