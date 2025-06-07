"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 1000);
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          className="border rounded px-2 py-1"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded px-2 py-1"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-black text-white rounded px-4 py-2" type="submit">
          Register
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Registered! Redirecting...</div>}
      </form>
      <div className="mt-4 text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="underline">
          Login
        </a>
      </div>
    </div>
  );
}
