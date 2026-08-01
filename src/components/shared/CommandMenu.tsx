"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce"; // We'll create this hook

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const debouncedValue = useDebounce(inputValue, 300);
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${debouncedValue}`)
      .then(res => res.json())
      .then(data => {
        if (data.results) setResults(data.results);
      })
      .finally(() => setLoading(false));
  }, [debouncedValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <Command label="Global Command Menu" shouldFilter={false} className="flex flex-col">
          <div className="flex items-center px-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <Command.Input 
              autoFocus
              placeholder="Search deals, clients, projects, invoices... (Cmd+K)" 
              value={inputValue}
              onValueChange={setInputValue}
              className="flex-1 h-14 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
            {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            <div className="text-xs text-gray-400 ml-2 px-2 py-1 bg-gray-100 rounded">ESC</div>
          </div>
          
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              {inputValue.length < 2 ? "Type to search..." : "No results found."}
            </Command.Empty>

            {results.length > 0 && (
              <Command.Group heading="Results" className="text-sm font-medium text-gray-500 px-2 py-2">
                {results.map((item, idx) => (
                  <Command.Item
                    key={`${item.id}-${idx}`}
                    onSelect={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                    className="flex items-center px-4 py-3 text-sm text-gray-900 rounded-md cursor-pointer hover:bg-indigo-50 aria-selected:bg-indigo-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded">{item.category}</span>
                        {item.type && <span className="capitalize">{item.type}</span>}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
