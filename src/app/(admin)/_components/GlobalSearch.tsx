"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { globalSearchAction } from "@/modules/search/actions";
import { SearchResult } from "@/modules/search/services";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { execute, result, isExecuting } = useAction(globalSearchAction);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        execute({ query });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [query, execute]);

  const onSelectResult = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const results = result.data?.results || [];

  return (
    <>
      <div className="relative hidden md:block" onClick={() => setOpen(true)}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search (Cmd+K)"
          className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search organizations, contacts, deals, projects..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isExecuting ? "Searching..." : "No results found."}
          </CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((res: SearchResult) => (
                <CommandItem
                  key={res.id}
                  value={`${res.title} ${res.subtitle}`}
                  onSelect={() => onSelectResult(res.url)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{res.title}</span>
                    <span className="text-xs text-gray-500">{res.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
