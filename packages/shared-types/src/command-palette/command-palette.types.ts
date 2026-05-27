// Command Palette types — shared across all features
// Features that want to register commands import CommandRegistry from here.
// The actual CommandRegistry implementation lives in features/command-palette.

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string; // e.g. "Ctrl+N"
  keywords?: string[];
  action?: () => void;
  /** Async search for dynamic results (e.g. search pending invoices by number) */
  search?: (query: string) => Promise<CommandItem[]>;
};

export type CommandGroup = {
  id: string;
  label: string;
  items: CommandItem[];
};

/** The registry that features use to register their commands */
export type CommandRegistry = {
  register: (entry: CommandItem | CommandGroup) => void;
  unregister: (id: string) => void;
};
