"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // In a real implementation, this would navigate to a full search results page
      // or hit an API and display inline.
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="flex items-center px-4 border-b border-gray-100">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
          <input
            autoFocus
            type="text"
            className="flex-1 h-14 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-lg"
            placeholder="Search organizations, deals, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded border border-gray-200">
            ESC
          </kbd>
        </form>
        <div className="p-4 max-h-80 overflow-y-auto">
          {query.trim().length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              Type to start searching...
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500">
              Press Enter to view all results for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
