import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2ff] p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-purple-700">SubFlow</h1>
        <p className="text-gray-500 mt-2 mb-7">Sign in to your account</p>

        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          required
          className="w-full border rounded-lg p-3 mt-2 mb-5 outline-purple-500"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          required
          className="w-full border rounded-lg p-3 mt-2 mb-4 outline-purple-500"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">
          Sign In
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-purple-600 font-semibold">Register</Link>
        </p>
      </form>
    </div>
  );
}