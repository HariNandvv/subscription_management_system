import { useEffect, useState } from "react";
import { Search, Users, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/users");

      // Display customer accounts, not admin accounts.
      setCustomers(res.data.filter((user) => user.role === "customer"));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 mt-1">
            Manage your registered customers.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {customers.length}
              </h2>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 outline-purple-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-500">
            Loading customers...
          </p>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchCustomers}
              className="text-purple-600 font-medium"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-4 px-3">Customer</th>
                  <th className="py-4 px-3">Email</th>
                  <th className="py-4 px-3">Role</th>
                  <th className="py-4 px-3">Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-4 px-3 font-medium text-gray-800">
                      {customer.name}
                    </td>
                    <td className="py-4 px-3 text-gray-500">
                      {customer.email}
                    </td>
                    <td className="py-4 px-3">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                        Customer
                      </span>
                    </td>
                    <td className="py-4 px-3 text-gray-500">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-12 text-gray-400"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}