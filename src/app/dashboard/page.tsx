"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface UserInfo extends Pick<User, "id" | "email"> {
  roles: string[];
  permissions: string[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
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

  function handleLogout() {
    const refreshToken = localStorage.getItem("refreshToken");
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/auth/login");
  }

  if (error) return <div className="p-8">{error}</div>;
  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 border rounded">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Dashboard</h1>
        <button className="text-sm underline" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div>
        <div>
          <b>Email:</b> {user.email}
        </div>
        <div>
          <b>Roles:</b> {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "None"}
        </div>
        <div>
          <b>Permissions:</b>
          <ul className="list-disc ml-6">
            {user.permissions && user.permissions.length > 0 ? (
              user.permissions.map((p) => <li key={p}>{p}</li>)
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-6">
        <a href="/access-control" className="underline">
          Access Control
        </a>
      </div>
    </div>
  );
}
