"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ProfileClient() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors text-red-600"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
        <span className="font-medium">Sign Out</span>
      </div>
    </button>
  );
}
