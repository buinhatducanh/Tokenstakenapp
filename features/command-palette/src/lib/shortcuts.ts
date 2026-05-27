/**
 * COMMAND_SHORTCUTS — Canonical keyboard shortcut definitions.
 *
 * ⚠️  IMPORTANT: Do NOT use Ctrl+N, Ctrl+T, Ctrl+W, Ctrl+Tab etc.
 *     Those are browser-reserved and web apps CANNOT intercept them.
 *     Use Alt+ prefix for all web app global shortcuts.
 */
export const COMMAND_SHORTCUTS = {
  /** Open / toggle the command palette (Ctrl/⌘+K is safe — browsers allow it) */
  OPEN_PALETTE: "Ctrl+K",

  /** Invoice actions */
  INVOICE_CREATE:  "Ctrl+I",
  INVOICE_APPROVE: "Ctrl+E",

  /** Transaction actions */
  TRANSACTION_CREATE: "Ctrl+G",

  /** Navigation */
  GO_DASHBOARD: "Alt+D",
  GO_INVOICES:  "Alt+I",
  GO_REPORTS:   "Alt+R",

  /** Auth */
  LOGOUT:     "",
  SWITCH_ORG: "",
} as const;

export type ShortcutKey = keyof typeof COMMAND_SHORTCUTS;

/**
 * Returns the modifier label based on the OS.
 * On macOS, Ctrl is displayed as "⌘".
 */
export function getModifierLabel(): "⌘" | "Ctrl" {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";
}
