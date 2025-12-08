"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    // Validate password
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/student/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    registerNo: roll.trim().toUpperCase(),
  }),
});


    const data = await res.json();
    
    if (data.ok) {
      router.push("/student/profile");
    } else {
      setError(data.error || "Invalid register number");
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1>Register Your Account</h1>
      <p>Enter your register number and set a password for email login</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: '600' }}>Register Number</label>
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
              borderRadius: 8,
              border: '1px solid #d1d5db'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: '600' }}>Password (Optional)</label>
          <input
            type="password"
            placeholder="Set a password for email login"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #d1d5db'
            }}
          />
        </div>
        
        {password && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '600' }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: 12, 
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #d1d5db'
              }}
            />
          </div>
        )}
        
        {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 12, 
            fontSize: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Registering..." : "Complete Registration"}
        </button>
      </form>
      
      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe' }}>
        <p style={{ fontSize: 14, color: '#1e40af', margin: 0 }}>
          <strong>Note:</strong> Setting a password allows you to log in using your email address instead of Google. 
          This is optional but recommended for convenience.
        </p>
      </div>
    </main>
  );
}