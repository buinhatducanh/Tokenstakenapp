import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle2, Circle, AlertCircle, Search, Filter, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

type InvoiceStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PAID";

interface Invoice {
  id: string;
  number: string;
  partner: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
}

const INITIAL_INVOICES: Invoice[] = [
  { id: "1", number: "INV-2024-001", partner: "Acme Corp", amount: 1500.00, date: "2024-05-10", status: "PENDING_APPROVAL" },
  { id: "2", number: "INV-2024-002", partner: "Global Tech", amount: 3200.50, date: "2024-05-11", status: "PENDING_APPROVAL" },
  { id: "3", number: "INV-2024-003", partner: "Stark Ind.", amount: 840.00, date: "2024-05-12", status: "PAID" },
  { id: "4", number: "INV-2024-004", partner: "Wayne Ent.", amount: 12000.00, date: "2024-05-13", status: "APPROVED" },
  { id: "5", number: "INV-2024-005", partner: "Daily Bugle", amount: 450.00, date: "2024-05-14", status: "DRAFT" },
];

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    // Simulate OCR processing
    setTimeout(() => {
      const newInvoices: Invoice[] = acceptedFiles.map((file, i) => ({
        id: Math.random().toString(36).substring(7),
        number: `INV-NEW-${Math.floor(Math.random() * 1000)}`,
        partner: "Extracted Partner " + (i + 1),
        amount: Math.floor(Math.random() * 5000) + 100,
        date: new Date().toISOString().split('T')[0],
        status: "PENDING_APPROVAL",
      }));
      setInvoices(prev => [...newInvoices, ...prev]);
      setIsUploading(false);
      toast.success(`Successfully extracted ${acceptedFiles.length} invoices`);
    }, 1500);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] } });

  const handleApprove = (id: string) => {
    // Optimistic UI Update
    const previousInvoices = [...invoices];
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "APPROVED" } : inv));
    
    // Simulate API call
    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance to fail just to demonstrate rollback
          Math.random() > 0.9 ? reject(new Error("Network Error")) : resolve("Success");
        }, 800);
      }),
      {
        loading: 'Approving...',
        success: 'Invoice approved successfully',
        error: (err) => {
          // Rollback
          setInvoices(previousInvoices);
          return `Approval failed: ${err.message}`;
        }
      }
    );
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.number.toLowerCase().includes(search.toLowerCase()) || 
    inv.partner.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "PENDING_APPROVAL": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "PAID": return "bg-blue-50 text-blue-700 ring-blue-600/20";
      default: return "bg-neutral-50 text-neutral-600 ring-neutral-500/20";
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case "PENDING_APPROVAL": return "Pending";
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage and approve your invoices efficiently.</p>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`mb-6 p-8 border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer ${
          isDragActive ? "border-indigo-500 bg-indigo-50" : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-full ${isDragActive ? "bg-indigo-100" : "bg-neutral-100"}`}>
            <UploadCloud className={`h-6 w-6 ${isDragActive ? "text-indigo-600" : "text-neutral-500"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {isUploading ? "Extracting data..." : isDragActive ? "Drop invoices here..." : "Click or drag invoices here to bulk process"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Supports PDF, PNG, JPG up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between py-3 border-b border-neutral-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search invoices..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-md border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50 sticky top-0 backdrop-blur-sm z-10">
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider w-8">
                <input type="checkbox" className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Invoice Number</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Partner</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-neutral-50/80 transition-colors group">
                <td className="px-4 py-3 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-neutral-900">{invoice.number}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                  {invoice.partner}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500">
                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(invoice.date))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  {invoice.status === "PENDING_APPROVAL" ? (
                    <button 
                      onClick={() => handleApprove(invoice.id)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded transition-colors"
                    >
                      Approve <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ml-1 tracking-wider text-indigo-400 font-sans">⌘⏎</span>
                    </button>
                  ) : (
                    <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                      <MoreHorizontal className="h-5 w-5 ml-auto" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 text-sm">
                  No invoices found. Try adjusting your search or upload new ones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
