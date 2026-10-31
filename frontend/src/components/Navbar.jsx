import { Bell, Search } from "lucide-react";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
      <div>
        <h2 className="font-semibold text-gray-800">Welcome back!</h2>
        <p className="text-sm text-gray-400">Here's what's happening today.</p>
      </div>

      <div className="flex items-center gap-5">
        <Search className="text-gray-400" />
        <Bell className="text-gray-400" />
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
          {(user.name || "U").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}