import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./layout/DashboardLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import { CreateMockData } from "./pages/CreateMockData";

import { Transactions } from "./pages/Transactions";
import { Reports } from "./pages/Reports";

// Placeholder component
export const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500">
    <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-xl font-medium text-neutral-900 mb-2">{title}</h2>
    <p className="text-sm">This module is under construction.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "invoices", Component: Invoices },
      { path: "invoices/new", Component: CreateMockData },
      { path: "transactions", Component: Transactions },
      { path: "transactions/new", Component: CreateMockData },
      { path: "reports", Component: Reports },
    ],
  },
]);
