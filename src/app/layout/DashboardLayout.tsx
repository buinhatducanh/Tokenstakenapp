import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";

import { 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  FileText, 
  Home, 
  Search, 
  Bell,
  LogOut,
  Hexagon
} from "lucide-react";
import { CommandPalette } from "../components/CommandPalette";

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", to: "/", icon: Home },
    { name: "Invoices", to: "/invoices", icon: FileText },
    { name: "Transactions", to: "/transactions", icon: CreditCard },
    { name: "Reports", to: "/reports", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`relative flex flex-col border-r border-neutral-200 bg-white transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-neutral-100">
          <div className={`flex items-center gap-2 overflow-hidden transition-all ${isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <Hexagon className="h-6 w-6 text-indigo-600 fill-indigo-100" />
            <span className="font-semibold tracking-tight whitespace-nowrap">Tokens_taken</span>
          </div>
          {isSidebarCollapsed && (
            <div className="w-full flex justify-center">
              <Hexagon className="h-6 w-6 text-indigo-600 fill-indigo-100" />
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`
              }
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`} />
              {!isSidebarCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-100 mt-auto flex flex-col gap-2">
          <button 
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors w-full"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
            title={isSidebarCollapsed ? "Log out" : "Log out"}
          >
            <LogOut className={`h-5 w-5 shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`} />
            {!isSidebarCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6 shrink-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex w-64 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <Search className="h-4 w-4" />
              <span>Search or command...</span>
              <kbd className="ml-auto rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] font-medium font-sans">
                ⌘K
              </kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative text-neutral-500 hover:text-neutral-900 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm border border-indigo-200">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-neutral-50 p-6">
          <Outlet />
        </div>
      </main>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </div>
  );
}
