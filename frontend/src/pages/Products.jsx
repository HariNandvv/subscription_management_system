
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  type: "",
  sale_price: "",
  cost_price: "",
  notes: ""
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...form,
        sale_price: Number(form.sale_price),
        cost_price: form.cost_price === "" ? null : Number(form.cost_price)
      };

      if (editing) {
        await api.put(`/products/${editing}`, data);
      } else {
        await api.post("/products", data);
      }

      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const editProduct = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name || "",
      type: product.type || "",
      sale_price: product.sale_price ?? "",
      cost_price: product.cost_price ?? "",
      notes: product.notes || ""
    });
    setShowForm(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product");
    }
  };

  const filtered = products.filter((p) =>
    `${p.name} ${p.type || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your products and pricing.
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
          <Plus size={18} /> Add Product
        </button>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-5">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl p-6 mb-6"
        >
          <div className="flex justify-between mb-5">
            <h2 className="font-semibold text-lg">
              {editing ? "Edit Product" : "Add New Product"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["name", "Product Name"],
              ["type", "Product Type"],
              ["sale_price", "Sale Price"],
              ["cost_price", "Cost Price"]
            ].map(([key, label]) => (
              <label key={key} className="text-sm text-gray-600">
                {label}
                <input
                  required={key === "name" || key === "sale_price"}
                  type={key.includes("price") ? "number" : "text"}
                  min={key.includes("price") ? "0" : undefined}
                  step={key.includes("price") ? "0.01" : undefined}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 mt-2 outline-purple-500"
                />
              </label>
            ))}

            <label className="text-sm text-gray-600 md:col-span-2">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                className="w-full border rounded-lg p-3 mt-2 outline-purple-500"
                rows="3"
              />
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <button className="bg-purple-600 text-white px-5 py-2.5 rounded-lg">
              {editing ? "Update Product" : "Save Product"}
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
            <h2 className="font-semibold text-gray-800">All Products</h2>
            <p className="text-sm text-gray-400">
              {products.length} products
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg pl-10 pr-3 py-2.5 outline-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">Sale Price</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-gray-500">{p.type || "—"}</td>
                  <td className="p-3">₹{Number(p.sale_price).toFixed(2)}</td>
                  <td className="p-3">
                    {p.cost_price == null
                      ? "—"
                      : `₹${Number(p.cost_price).toFixed(2)}`}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => editProduct(p)}
                        className="text-purple-600"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
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
                    No products found.
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
