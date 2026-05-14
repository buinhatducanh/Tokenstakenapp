import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router";
import { 
  FileText, 
  Home, 
  Plus, 
  Search, 
  Settings, 
  CheckCircle,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

export function CommandPalette({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
    >
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
        aria-hidden="true" 
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center border-b border-neutral-100 px-3 h-12">
          <Search className="mr-2 h-5 w-5 shrink-0 text-neutral-400" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 text-sm text-neutral-700">
          <Command.Empty className="py-6 text-center text-sm text-neutral-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-neutral-500">
            <Command.Item
              onSelect={() => runCommand(() => {
                navigate("/invoices");
                toast.success("Ready to create a new invoice.");
              })}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4 text-neutral-400" />
              Create Invoice
              <span className="ml-auto text-xs text-neutral-400 tracking-widest">Ctrl+N</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => {
                navigate("/invoices");
                toast.success("Ready to bulk approve pending invoices.");
              })}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900"
            >
              <CheckCircle className="mr-2 h-4 w-4 text-neutral-400" />
              Approve Pending
              <span className="ml-auto text-xs text-neutral-400 tracking-widest">Ctrl+A</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => toast("Opening new transaction form..."))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900"
            >
              <CreditCard className="mr-2 h-4 w-4 text-neutral-400" />
              New Transaction
              <span className="ml-auto text-xs text-neutral-400 tracking-widest">Ctrl+T</span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="-mx-2 my-1 h-px bg-neutral-100" />

          <Command.Group heading="Navigate" className="px-2 py-1.5 text-xs font-medium text-neutral-500">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900"
            >
              <Home className="mr-2 h-4 w-4 text-neutral-400" />
              Go to Dashboard
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/invoices"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900"
            >
              <FileText className="mr-2 h-4 w-4 text-neutral-400" />
              Go to Invoices
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => toast("Settings opened."))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900"
            >
              <Settings className="mr-2 h-4 w-4 text-neutral-400" />
              Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
