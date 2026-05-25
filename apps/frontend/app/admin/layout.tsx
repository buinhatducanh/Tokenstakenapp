
"use client";

import AdminSidebar from "@/components/admin-sidebar";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function AdminLayout({ children }: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout(); // gọi backend xóa cookie
    router.replace("/login"); // quay về login
  };

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        {/* 🔥 NÚT LOGOUT */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 16px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Đăng xuất
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}