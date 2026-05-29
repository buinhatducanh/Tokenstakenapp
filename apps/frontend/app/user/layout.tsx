// import UserSidebar
// from '@/components/user-sidebar';

// export default function UserLayout({
//   children,
// }: any) {
//   return (
//     <div
//       style={{
//         display: 'flex',
//       }}
//     >


//       <div
//         style={{
//           flex: 1,
//           padding: '20px',
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  FileText,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Hexagon,
  LogOut,
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/user", icon: Home },
    { name: "Invoices", href: "/user/invoices", icon: FileText },
    { name: "Transactions", href: "/user/transactions", icon: CreditCard },
    { name: "Reports", href: "/user/reports", icon: BarChart3 },
  ];

  return (
    <>
      <style jsx>{`
        .wrapper {
          display: flex;
          height: 100vh;
          width: 100%;
          background: #f5f5f5;
          color: #111;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          width: 240px;
          background: #fff;
          border-right: 1px solid #e5e5e5;
          transition: 0.3s ease;
        }

        .collapsed {
          width: 70px;
        }

        .logo {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #e5e5e5;
        }

        .logoText {
          margin-left: 8px;
          font-weight: 600;
        }

        .nav {
          flex: 1;
          padding: 8px;
        }

        .navItem {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: 0.2s;
        }

        .navItem:hover {
          background: #f3f4f6;
        }

        .active {
          background: #e0e7ff;
          color: #4338ca;
        }

        .footer {
          border-top: 1px solid #e5e5e5;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn {
          padding: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn:hover {
          background: #f3f4f6;
        }

        .logout {
          color: red;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .header {
          height: 56px;
          border-bottom: 1px solid #e5e5e5;
          background: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
        }

        .search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          padding: 6px 10px;
          border-radius: 6px;
        }

        .input {
          border: none;
          outline: none;
          background: transparent;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #c7d2fe;
        }

        .content {
          flex: 1;
          padding: 16px;
          overflow: auto;
        }
      `}</style>

      <div className="wrapper">
        {/* SIDEBAR */}
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="logo">
            <Hexagon color="#4f46e5" />
            {!collapsed && <span className="logoText">Tokens_taken</span>}
          </div>

          <nav className="nav">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`navItem ${active ? "active" : ""}`}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          <div className="footer">
            <button
              className="btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>

            <button
              className="btn logout"
              onClick={() => router.push("/login")}
            >
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="header">
            <div className="search">
              <Search size={16} />
              <input className="input" placeholder="Search..." />
            </div>

            <div className="right">
              <Bell size={20} />
              <div className="avatar" />
            </div>
          </header>

          <main className="content">{children}</main>
        </div>
      </div>
    </>
  );
}