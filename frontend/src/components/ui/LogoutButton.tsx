"use client";

import { createClient } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation"; // ✅ usePathname importieren

export default function LogoutButton() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Aktuellen Pfad holen
  const supabase = createClient();

  // ✅ Logik: Button auf der Login-Seite ausblenden
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "fixed",
        top: "24px",
        left: "24px",
        zIndex: 9999,
        background: "#222",
        color: "#ff4d4d",
        border: "1px solid #444",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}
    >
      Logout
    </button>
  );
}