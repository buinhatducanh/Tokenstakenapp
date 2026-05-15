// Task 5: Command Palette Feature — ⌘K Overlay, Fuzzy Search, Keyboard Shortcuts
// Public API surface.

export { CommandPalette } from "./components/CommandPalette";
export { useCommandPalette, CommandPaletteProvider } from "./hooks/useCommandPalette";
export { fuzzySearch, CommandRegistry } from "./lib/command-registry";
export { COMMAND_SHORTCUTS } from "./lib/shortcuts";
