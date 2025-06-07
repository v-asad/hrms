"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessControlPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load user");
        return;
      }
      setUser(data);
    }
    fetchMe();
  }, [router]);

  if (error) return <div className="p-8">{error}</div>;
  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl mb-4">Access Control</h1>
      <div>
        <div><b>Your Roles:</b> {user.roles.join(", ") || "None"}</div>
        <div><b>Your Permissions:</b> {user.permissions.join(", ") || "None"}</div>
      </div>
      <div className="mt-6">
        <a href="/dashboard" className="underline">Back to Dashboard</a>
      </div>
      {/* You can add role/permission management UI here */}
    </div>
  );
}
