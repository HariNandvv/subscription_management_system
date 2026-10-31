import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2ff] p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-purple-700">SubFlow</h1>
        <p className="text-gray-500 mt-2 mb-7">Create your account</p>

        {["name", "email", "password"].map((field) => (
          <div key={field} className="mb-5">
            <label className="text-sm font-medium capitalize">{field}</label>
            <input
              required
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              className="w-full border rounded-lg p-3 mt-2 outline-purple-500"
              placeholder={`Enter your ${field}`}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">
          Create Account
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered? <Link to="/" className="text-purple-600 font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
}