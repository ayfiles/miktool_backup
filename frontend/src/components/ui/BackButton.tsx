"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Logik: Ausblenden auf Startseite, Client-Liste UND Login
  if (pathname === "/" || pathname === "/clients" || pathname === "/login") {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        background: "#222",
        color: "#fff",
        border: "1px solid #444",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}
    >
      <span>←</span> Zurück
    </button>
  );
}