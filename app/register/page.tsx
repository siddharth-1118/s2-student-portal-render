"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roll, setRoll] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: session.user?.email, 
        roll: roll.trim().toUpperCase() 
      }),
    });

    const data = await res.json();
    
    if (data.ok) {
      router.push("/marks/me");
    } else {
      setError(data.error || "Invalid register number");
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1>Register Your Roll Number</h1>
      <p>Enter your register number to link your account</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <input
          type="text"
          placeholder="RA2511028010868"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          required
          style={{ 
            width: "100%", 
            padding: 12, 
            fontSize: 16,
            marginBottom: 16
          }}
        />
        
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 12, 
            fontSize: 16 
          }}
        >
          {loading ? "Registering..." : "Submit"}
        </button>
      </form>
    </main>
  );
}
