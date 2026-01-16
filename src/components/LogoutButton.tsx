"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
    >
      <LogOut size={18} />
      {/* Hide text on mobile, show on desktop */}
      <span className="hidden md:inline text-sm font-medium">Logout</span>
    </button>
  );
}
