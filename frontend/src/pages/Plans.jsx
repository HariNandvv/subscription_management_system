
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  price: "",
  billing_interval: "monthly",
  minimum_quantity: 1,
  available_from: "",
  available_until: "",
  auto_close: false,
  allow_early_close: true,
  allow_pause: true,
  allow_renew: true,
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plans");
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...form,
        price: Number(form.price),
        minimum_quantity: Number(form.minimum_quantity),
        available_from: form.available_from || null,
        available_until: form.available_until || null,
      };

      if (editing) {
        await api.put(`/plans/${editing}`, data);
      } else {
        await api.post("/plans", data);
      }

      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save plan");
    }
  };

  const editPlan = (plan) => {
    setEditing(plan.id);

    setForm({
      name: plan.name || "",
      price: plan.price ?? "",
      billing_interval: plan.billing_interval || "monthly",
      minimum_quantity: plan.minimum_quantity ?? 1,
      available_from: plan.available_from
        ? String(plan.available_from).slice(0, 10)
        : "",
      available_until: plan.available_until
        ? String(plan.available_until).slice(0, 10)
        : "",
      auto_close: Boolean(plan.auto_close),
      allow_early_close: Boolean(plan.allow_early_close),
      allow_pause: Boolean(plan.allow_pause),
      allow_renew: Boolean(plan.allow_renew),
    });

    setShowForm(true);
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await api.delete(`/plans/${id}`);
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete plan");
    }
  };

  const filtered = plans.filter((plan) =>
    plan.name.toLowerCase().includes(search.toLowerCase())
  );

  const fields = [
    ["auto_close", "Automatically close"],
    ["allow_early_close", "Allow early closure"],
    ["allow_pause", "Allow subscription pause"],
    ["allow_renew", "Allow renewal"],
  ];

  return (
    <div className="p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plans</h1>
          <p className="text-gray-500 mt-1">
            Create and manage subscription plans.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} /> Create Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {editing ? "Edit Plan" : "Create New Plan"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="text-sm text-gray-600">
              Plan Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-3 mt-2"
                placeholder="Premium Plan"
              />
            </label>

            <label className="text-sm text-gray-600">
              Price
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-lg p-3 mt-2"
                placeholder="999"
              />
            </label>

            <label className="text-sm text-gray-600">
              Billing Interval
              <select
                value={form.billing_interval}
                onChange={(e) =>
                  setForm({ ...form, billing_interval: e.target.value })
                }
                className="w-full border rounded-lg p-3 mt-2"
              >
                {["daily", "weekly", "monthly", "yearly"].map((interval) => (
                  <option key={interval} value={interval}>
                    {interval.charAt(0).toUpperCase() + interval.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-gray-600">
              Minimum Quantity
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.minimum_quantity}
                onChange={(e) =>
                  setForm({ ...form, minimum_quantity: e.target.value })
                }
                className="w-full border rounded-lg p-3 mt-2"
              />
            </label>

            <label className="text-sm text-gray-600">
              Available From
              <input
                type="date"
                value={form.available_from}
                onChange={(e) =>
                  setForm({ ...form, available_from: e.target.value })
                }
                className="w-full border rounded-lg p-3 mt-2"
              />
            </label>

            <label className="text-sm text-gray-600">
              Available Until
              <input
                type="date"
                value={form.available_until}
                onChange={(e) =>
                  setForm({ ...form, available_until: e.target.value })
                }
                className="w-full border rounded-lg p-3 mt-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {fields.map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.checked })
                  }
                  className="w-4 h-4 accent-purple-600"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-7">
            <button className="bg-purple-600 text-white px-5 py-2.5 rounded-lg">
              {editing ? "Update Plan" : "Save Plan"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border px-5 py-2.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl p-6">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="font-semibold text-gray-800">All Plans</h2>
            <p className="text-sm text-gray-400">{plans.length} plans</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="border rounded-lg pl-10 pr-3 py-2.5"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="p-3">Plan</th>
                <th className="p-3">Price</th>
                <th className="p-3">Interval</th>
                <th className="p-3">Minimum Qty</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{plan.name}</td>
                  <td className="p-3">₹{Number(plan.price).toFixed(2)}</td>
                  <td className="p-3 capitalize">{plan.billing_interval || "—"}</td>
                  <td className="p-3">{plan.minimum_quantity}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => editPlan(plan)}
                        className="text-purple-600"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
