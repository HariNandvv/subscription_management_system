
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import api from "../services/api";

const statuses = ["draft", "quotation", "confirmed", "active", "paused", "closed"];

const emptyForm = {
  subscription_number: "",
  customer_id: "",
  plan_id: "",
  start_date: "",
  expiry_date: "",
  status: "draft",
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
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
      const [subRes, userRes, planRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/users"),
        api.get("/plans"),
      ]);

      setSubscriptions(subRes.data);
      setCustomers(userRes.data.filter(user => user.role === "customer"));
      setPlans(planRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (sub) => {
    setEditing(sub.id);
    setForm({
      subscription_number: sub.subscription_number || "",
      customer_id: sub.customer_id,
      plan_id: sub.plan_id,
      start_date: sub.start_date?.slice(0, 10) || "",
      expiry_date: sub.expiry_date?.slice(0, 10) || "",
      status: sub.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = {
      ...form,
      customer_id: Number(form.customer_id),
      plan_id: Number(form.plan_id),
      start_date: form.start_date || null,
      expiry_date: form.expiry_date || null,
    };

    try {
      if (editing) {
        await api.put(`/subscriptions/${editing}`, data);
      } else {
        await api.post("/subscriptions", data);
      }

      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save subscription");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/subscriptions/${id}/status`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteSubscription = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;

    try {
      await api.delete(`/subscriptions/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete subscription");
    }
  };

  const filtered = subscriptions.filter(sub =>
    `${sub.subscription_number || ""} ${sub.plan_name || ""} ${sub.customer_id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer subscriptions</p>
        </div>

        <button onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg">
          <Plus size={18} /> New Subscription
        </button>
      </div>

      {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</p>}

      <div className="bg-white p-4 rounded-xl border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full border rounded-lg pl-10 pr-3 py-2 outline-purple-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500">Loading subscriptions...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Number", "Customer ID", "Plan", "Start Date", "Expiry Date", "Status", "Actions"].map(h =>
                  <th key={h} className="p-4 font-medium">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => (
                <tr key={sub.id} className="border-t">
                  <td className="p-4 font-medium">{sub.subscription_number || `SUB-${sub.id}`}</td>
                  <td className="p-4">{sub.customer_id}</td>
                  <td className="p-4">{sub.plan_name}</td>
                  <td className="p-4">{sub.start_date?.slice(0, 10) || "-"}</td>
                  <td className="p-4">{sub.expiry_date?.slice(0, 10) || "-"}</td>
                  <td className="p-4">
                    <select value={sub.status}
                      onChange={e => changeStatus(sub.id, e.target.value)}
                      className="border rounded-lg p-2 capitalize">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(sub)} className="text-purple-600">
                        <Pencil size={17} />
                      </button>
                      <button onClick={() => deleteSubscription(sub.id)} className="text-red-500">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No subscriptions found</td></tr>
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
              <h2 className="text-xl font-bold">{editing ? "Edit Subscription" : "New Subscription"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X /></button>
            </div>

            <div>
              <label className="text-sm font-medium">Subscription Number</label>
              <input value={form.subscription_number}
                onChange={e => setForm({...form, subscription_number: e.target.value})}
                placeholder="Auto-generated if left empty"
                className="w-full border rounded-lg p-3 mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium">Customer</label>
              <select required value={form.customer_id}
                onChange={e => setForm({...form, customer_id: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1">
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Plan</label>
              <select required value={form.plan_id}
                onChange={e => setForm({...form, plan_id: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1">
                <option value="">Select plan</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input type="date" value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <input type="date" value={form.expiry_date}
                  onChange={e => setForm({...form, expiry_date: e.target.value})}
                  className="w-full border rounded-lg p-3 mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg p-3 mt-1 capitalize">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">
              {editing ? "Save Changes" : "Create Subscription"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
