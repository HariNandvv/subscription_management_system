import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, CreditCard,
  FileText, Layers, LogOut
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const adminLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Products", path: "/products", icon: Package },
    { name: "Subscriptions", path: "/subscriptions", icon: Layers },
    { name: "Invoices", path: "/invoices", icon: FileText },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Plans", path: "/plans", icon: Package },
    { name: "Discounts", path: "/discounts", icon: Tag },
  ];

  const customerLinks = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Subscriptions", path: "/my-subscriptions", icon: Layers },
    { name: "My Invoices", path: "/my-invoices", icon: FileText },
    { name: "My Payments", path: "/my-payments", icon: CreditCard },
    { name: "Plans", path: "/plans", icon: Package },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <aside className="w-64 shrink-0 bg-[#21183d] text-white min-h-screen p-5 flex flex-col">
      <h1 className="text-2xl font-bold mb-10">
        Sub<span className="text-purple-400">Flow</span>
      </h1>

      <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">
        {isAdmin ? "Administration" : "My Account"}
      </p>

      <nav className="space-y-2">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            <Icon size={19} />
            {name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 p-3 text-gray-300 hover:text-white"
      >
        <LogOut size={19} /> Logout
      </button>
    </aside>
  );
}