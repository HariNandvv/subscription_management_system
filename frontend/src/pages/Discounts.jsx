
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_purchase: 0,
  minimum_quantity: 1,
  start_date: "",
  end_date: "",
  usage_limit: "",
  applies_to: "product",
  product_ids: [],
};

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [discountRes, productRes] = await Promise.all([
        api.get("/discounts"),
        api.get("/products"),
      ]);

      setDiscounts(discountRes.data);
      setProducts(productRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = async (discount) => {
    try {
      const res = await api.get(`/discounts/${discount.id}`);
      const data = res.data;

      setEditing(discount.id);
      setForm({
        name: data.name || "",
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        minimum_purchase: data.minimum_purchase ?? 0,
        minimum_quantity: data.minimum_quantity ?? 1,
        start_date: data.start_date?.slice(0, 10) || "",
        end_date: data.end_date?.slice(0, 10) || "",
        usage_limit: data.usage_limit ?? "",
        applies_to: data.applies_to,
        product_ids: data.product_ids || [],
      });

      setShowForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load discount details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = {
      ...form,
      discount_value: Number(form.discount_value),
      minimum_purchase: Number(form.minimum_purchase || 0),
      minimum_quantity: Number(form.minimum_quantity || 1),
      usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
      product_ids: form.applies_to === "product" ? form.product_ids : [],
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    try {
      if (editing) {
        await api.put(`/discounts/${editing}`, data);
      } else {
        await api.post("/discounts", data);
      }

      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save discount");
    }
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm("Delete this discount?")) return;

    try {
      await api.delete(`/discounts/${id}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete discount");
    }
  };

  const toggleProduct = (id) => {
    setForm(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(id)
        ? prev.product_ids.filter(item => item !== id)
        : [...prev.product_ids, id],
    }));
  };

  const filtered = discounts.filter(discount =>
    discount.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Discounts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage product and subscription discounts
          </p>
        </div>

        <button onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg">
          <Plus size={18} /> Add Discount
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
            placeholder="Search discounts..."
            className="w-full border rounded-lg pl-10 pr-3 py-2 outline-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500">Loading discounts...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Name", "Type", "Value", "Applies To", "Start Date", "End Date", "Actions"].map(h =>
                  <th key={h} className="p-4 font-medium">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(discount => (
                <tr key={discount.id} className="border-t">
                  <td className="p-4 font-medium">{discount.name}</td>
                  <td className="p-4 capitalize">{discount.discount_type}</td>
                  <td className="p-4">
                    {discount.discount_type === "percentage"
                      ? `${discount.discount_value}%`
                      : `₹${discount.discount_value}`}
                  </td>
                  <td className="p-4 capitalize">{discount.applies_to}</td>
                  <td className="p-4">{discount.start_date?.slice(0, 10) || "-"}</td>
                  <td className="p-4">{discount.end_date?.slice(0, 10) || "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(discount)} className="text-purple-600">
                        <Pencil size={17} />
                      </button>
                      <button onClick={() => deleteDiscount(discount.id)} className="text-red-500">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No discounts found
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
            className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editing ? "Edit Discount" : "Create Discount"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">Discount Name</label>
              <input required value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1"
                placeholder="e.g. Summer Offer" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select value={form.discount_type}
                  onChange={e => setForm({...form, discount_type: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Value {form.discount_type === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input required type="number" min="0"
                  max={form.discount_type === "percentage" ? 100 : undefined}
                  step="0.01" value={form.discount_value}
                  onChange={e => setForm({...form, discount_value: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Applies To</label>
              <select value={form.applies_to}
                onChange={e => setForm({
                  ...form,
                  applies_to: e.target.value,
                  product_ids: [],
                })}
                className="w-full border rounded-lg p-3 mt-1">
                <option value="product">Products</option>
                <option value="subscription">Subscriptions</option>
              </select>
            </div>

            {form.applies_to === "product" && (
              <div>
                <label className="text-sm font-medium">Select Products</label>
                <div className="border rounded-lg p-3 mt-1 max-h-40 overflow-y-auto space-y-2">
                  {products.map(product => (
                    <label key={product.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox"
                        checked={form.product_ids.includes(product.id)}
                        onChange={() => toggleProduct(product.id)} />
                      {product.name}
                    </label>
                  ))}
                  {products.length === 0 && (
                    <p className="text-sm text-gray-400">No products available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select at least one product.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Minimum Purchase (₹)</label>
                <input type="number" min="0" step="0.01"
                  value={form.minimum_purchase}
                  onChange={e => setForm({...form, minimum_purchase: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Quantity</label>
                <input type="number" min="1"
                  value={form.minimum_quantity}
                  onChange={e => setForm({...form, minimum_quantity: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input type="date" value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <input type="date" value={form.end_date}
                  onChange={e => setForm({...form, end_date: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Usage Limit</label>
              <input type="number" min="1"
                value={form.usage_limit}
                onChange={e => setForm({...form, usage_limit: e.target.value})}
                placeholder="Leave empty for unlimited"
                className="w-full border rounded-lg p-3 mt-1" />
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">
              {editing ? "Save Changes" : "Create Discount"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
