import { Layers, FileText, CreditCard } from "lucide-react";

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const cards = [
    { title: "My Subscriptions", value: "Coming soon", icon: Layers },
    { title: "My Invoices", value: "Coming soon", icon: FileText },
    { title: "Payment History", value: "Coming soon", icon: CreditCard },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {user.name || "Customer"}!
      </h1>
      <p className="text-gray-500 mt-2">
        Manage your subscriptions and payments in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        {cards.map(({ title, value, icon: Icon }) => (
          <div key={title} className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg w-fit">
              <Icon size={22} />
            </div>
            <p className="text-gray-500 mt-5">{title}</p>
            <h2 className="text-xl font-bold text-gray-800 mt-2">{value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
        <h2 className="font-semibold text-gray-800">Account Overview</h2>
        <p className="text-gray-500 text-sm mt-4">
          Name: {user.name || "Not available"}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Email: {user.email || "Not available"}
        </p>
      </div>
    </div>
  );
}