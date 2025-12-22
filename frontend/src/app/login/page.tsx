"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Erfolg! Zurück zur Startseite und Cache leeren
      router.refresh();
      router.push("/");
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh", 
      background: "#0a0a0a" 
    }}>
      <form 
        onSubmit={handleLogin} 
        style={{ 
          background: "#111", 
          padding: "40px", 
          borderRadius: "8px", 
          border: "1px solid #333",
          width: "100%",
          maxWidth: "400px"
        }}
      >
        <h1 style={{ marginBottom: "20px", textAlign: "center" }}>Miktool Login</h1>
        
        {error && (
          <div style={{ color: "#ff4d4d", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@miktool.com"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••"
            style={{ width: "100%" }}
          />
        </div>

        <button type="submit" style={{ width: "100%", background: "#fff", color: "#000", fontWeight: "bold" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}