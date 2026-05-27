import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CommandRegistryImpl } from "../lib/command-registry";
import type { CommandRegistry } from "@packages/shared-types";

// ── Context ───────────────────────────────────────────────────────────────────

interface CommandPaletteContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registry: CommandRegistry;
  /** Access the impl-specific search method */
  registryImpl: CommandRegistryImpl;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface CommandPaletteProviderProps {
  children: ReactNode;
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const registryRef = useRef<CommandRegistryImpl>(new CommandRegistryImpl());

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Global keyboard shortcuts:
  // 1. Ctrl+K / ⌘+K  → toggle palette
  // 2. Escape         → close palette
  // 3. Any registered command shortcut (e.g. Ctrl+N) → run action directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
        return;
      }
      // Close palette
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      // Fire registered command shortcuts (e.g. "Ctrl+N", "Ctrl+T")
      const items = registryRef.current.getAllItems();
      for (const item of items) {
        if (!item.shortcut || !item.action) continue;
        if (matchesShortcut(e, item.shortcut)) {
          e.preventDefault();
          item.action();
          return;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const value = useMemo<CommandPaletteContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      registry: registryRef.current,
      registryImpl: registryRef.current,
    }),
    [isOpen, open, close, toggle]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>.");
  }
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a shortcut string like "Alt+N", "Alt+T", "Ctrl+K"
 * and check if the given KeyboardEvent matches it.
 *
 * NOTE: Do NOT register global shortcuts using Ctrl+N, Ctrl+T, Ctrl+W, etc.
 * Those are browser-reserved and cannot be intercepted by web apps.
 * Use Alt+ prefix for web app global shortcuts instead.
 *
 * Supported modifiers: Ctrl, Meta (⌘), Alt, Shift
 */
function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split("+").map((p) => p.trim().toLowerCase());

  const needsCtrl  = parts.includes("ctrl");
  const needsMeta  = parts.includes("meta") || parts.includes("cmd") || parts.includes("⌘");
  const needsAlt   = parts.includes("alt");
  const needsShift = parts.includes("shift");

  // The actual key is the part that is NOT a modifier
  const modifiers = new Set(["ctrl", "meta", "cmd", "⌘", "alt", "shift"]);
  const keyParts  = parts.filter((p) => !modifiers.has(p));
  if (keyParts.length !== 1) return false;
  const expectedKey = keyParts[0];

  return (
    e.key.toLowerCase() === expectedKey &&
    // On macOS: Meta (⌘) maps to metaKey; on Windows: Ctrl maps to ctrlKey
    (needsMeta ? e.metaKey : e.ctrlKey === needsCtrl) &&
    e.altKey   === needsAlt &&
    e.shiftKey === needsShift
  );
}
