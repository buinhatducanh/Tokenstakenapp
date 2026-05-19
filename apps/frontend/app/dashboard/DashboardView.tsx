"use client";

import { useEffect, useState } from "react";
import { getMe, logout } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/auth/token";
import { useRouter } from "next/navigation";

export default function DashboardView() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = tokenStorage.get();

    if (!token) {
      router.push("/login");
      return;
    }

    getMe(token).then(setUser);
  }, []);

  const handleLogout = async () => {
    const token = tokenStorage.get();

    if (token) await logout(token);

    tokenStorage.remove();
    router.push("/login");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>DASHBOARD</h1>

      {user && <p>Welcome: {user.email}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}