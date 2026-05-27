import type { CommandItem, CommandGroup, CommandRegistry } from "@packages/shared-types";

// Re-export types from shared-types for convenience
export type { CommandItem, CommandGroup, CommandRegistry };

// ── fuzzySearch ───────────────────────────────────────────────────────────────

/**
 * Fuzzy match: returns true if every char in `query` appears in `str` in order.
 * Case-insensitive.
 */
export function fuzzySearch(query: string, str: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const s = str.toLowerCase();
  let qi = 0;
  for (let si = 0; si < s.length && qi < q.length; si++) {
    if (s[si] === q[qi]) qi++;
  }
  return qi === q.length;
}

// ── CommandRegistry implementation ───────────────────────────────────────────

type Listener = () => void;

/**
 * CommandRegistry implementation used by the Command Palette.
 * Features register commands via this registry.
 * The registry lives inside the app (created in CommandPaletteProvider).
 */
export class CommandRegistryImpl implements CommandRegistry {
  private entries = new Map<string, CommandItem | CommandGroup>();
  private listeners = new Set<Listener>();

  register(entry: CommandItem | CommandGroup): void {
    this.entries.set(entry.id, entry);
    this._notify();
  }

  unregister(id: string): void {
    this.entries.delete(id);
    this._notify();
  }

  /** Get all registered entries (groups + standalone items) */
  getAll(): (CommandItem | CommandGroup)[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get a flat list of all CommandItems (flattening groups).
   * Used for global keyboard shortcut matching.
   */
  getAllItems(): CommandItem[] {
    const result: CommandItem[] = [];
    for (const entry of this.entries.values()) {
      if ("items" in entry) {
        result.push(...entry.items);
      } else {
        result.push(entry as CommandItem);
      }
    }
    return result;
  }

  /**
   * Return filtered entries matching the query.
   * Groups are filtered to only show matching items.
   */
  search(query: string): (CommandItem | CommandGroup)[] {
    const all = this.getAll();
    if (!query.trim()) return all;

    return all
      .map((entry) => {
        if ("items" in entry) {
          // It's a CommandGroup — filter items
          const matchedItems = entry.items.filter((item: CommandItem) => matchesQuery(item, query));
          return matchedItems.length > 0 ? { ...entry, items: matchedItems } : null;
        }
        // It's a CommandItem
        return matchesQuery(entry as CommandItem, query) ? entry : null;
      })
      .filter((e): e is CommandItem | CommandGroup => e !== null);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private _notify(): void {
    this.listeners.forEach((l) => l());
  }
}

function matchesQuery(item: CommandItem, query: string): boolean {
  const haystack = [item.label, item.description ?? "", ...(item.keywords ?? [])].join(" ");
  return fuzzySearch(query, haystack);
}
