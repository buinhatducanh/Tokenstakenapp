import React, { useState, useEffect, useRef } from "react";
import { Command } from "cmdk";
import { Search, Loader2 } from "lucide-react";
import { useCommandPalette } from "../hooks/useCommandPalette";
import type { CommandItem, CommandGroup } from "@packages/shared-types";

function isGroup(entry: CommandItem | CommandGroup): entry is CommandGroup {
  return "items" in entry;
}

export function CommandPalette() {
  const { isOpen, close, registryImpl } = useCommandPalette();
  const [query, setQuery] = useState("");

  // ── Async search state ────────────────────────────────────────────────────
  const [asyncResults, setAsyncResults] = useState<CommandItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to registry changes
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = registryImpl.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, [registryImpl]);

  // When query changes: run async search on all items that have a search() fn
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setAsyncResults([]);
      setIsSearching(false);
      return;
    }

    const itemsWithSearch = registryImpl.getAllItems().filter((i) => i.search);
    if (itemsWithSearch.length === 0) {
      setAsyncResults([]);
      return;
    }

    setIsSearching(true);

    // Debounce 300ms to avoid spamming API on every keystroke
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await Promise.all(
          itemsWithSearch.map((item) => item.search!(query))
        );
        setAsyncResults(results.flat());
      } catch (err) {
        console.error("[CommandPalette] async search error:", err);
        setAsyncResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, registryImpl]);

  // Combine static fuzzy search results + dynamic async results
  const staticFiltered = registryImpl.search(query);
  // If no query, show static only; if query, merge async results under a separate group
  const hasAsyncResults = asyncResults.length > 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelect = (item: CommandItem) => {
    close();
    setQuery("");
    setAsyncResults([]);
    item.action?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setQuery("");
      setAsyncResults([]);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      label="Global Command Menu"
      shouldFilter={false}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={() => handleOpenChange(false)}
        aria-hidden="true"
      />

      {/* Panel — full width on mobile, max-w-lg on desktop; height capped to viewport */}
      <div className="relative w-full max-w-lg flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
        style={{ maxHeight: "calc(100vh - 10vh - 48px)" }}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-neutral-100 px-3 h-12">
          <Search className="mr-2 h-5 w-5 shrink-0 text-neutral-400" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Type a command or search..."
            className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-neutral-400"
          />
          {isSearching && (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 text-neutral-400 animate-spin" />
          )}
        </div>

        {/* Results — scrolls independently, grows to fill available space */}
        <Command.List className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-0">
          <Command.Empty className="py-8 text-center text-sm text-neutral-500">
            {isSearching ? "Searching..." : "No results found."}
          </Command.Empty>

          {/* Static results (fuzzy-matched from registry) */}
          {staticFiltered.map((entry) =>
            isGroup(entry) ? (
              <Command.Group
                key={entry.id}
                heading={entry.label}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500"
              >
                {entry.items.map((item: CommandItem) => (
                  <CommandItemRow key={item.id} item={item} onSelect={handleSelect} />
                ))}
              </Command.Group>
            ) : (
              <CommandItemRow
                key={(entry as CommandItem).id}
                item={entry as CommandItem}
                onSelect={handleSelect}
              />
            )
          )}

          {/* Async / dynamic results (e.g. pending invoice search) */}
          {hasAsyncResults && (
            <Command.Group
              heading="Kết quả tìm kiếm"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-indigo-500"
            >
              {asyncResults.map((item) => (
                <CommandItemRow key={item.id} item={item} onSelect={handleSelect} />
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-4 py-2">
          <span className="text-xs text-neutral-400">
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 font-sans text-[10px]">↑↓</kbd>{" "}
            navigate
          </span>
          <span className="text-xs text-neutral-400">
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 font-sans text-[10px]">↵</kbd>{" "}
            select
          </span>
          <span className="text-xs text-neutral-400">
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 font-sans text-[10px]">Esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}

// ── CommandItemRow ────────────────────────────────────────────────────────────

function CommandItemRow({
  item,
  onSelect,
}: {
  item: CommandItem;
  onSelect: (item: CommandItem) => void;
}) {
  return (
    <Command.Item
      value={item.id}
      onSelect={() => onSelect(item)}
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-neutral-100 aria-selected:text-neutral-900"
    >
      <div className="flex flex-col flex-1 min-w-0">
        <span className="truncate">{item.label}</span>
        {item.description && (
          <span className="text-xs text-neutral-400 truncate">{item.description}</span>
        )}
      </div>
      {item.shortcut && (
        <span className="ml-3 flex items-center gap-0.5 shrink-0">
          {item.shortcut.split("+").map((key: string) => (
            <kbd
              key={key}
              className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-sans text-neutral-400"
            >
              {key}
            </kbd>
          ))}
        </span>
      )}
    </Command.Item>
  );
}
