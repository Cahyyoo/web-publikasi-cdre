"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari artikel, produk..."
        className="w-40 rounded-lg border border-brand/10 bg-white/60 py-2 pl-8 pr-3 text-sm text-stone-700 placeholder:text-stone-400 group-data-[transparent=true]/nav:border-white/25 group-data-[transparent=true]/nav:bg-white/15 group-data-[transparent=true]/nav:text-white group-data-[transparent=true]/nav:placeholder:text-white/70 outline-none transition-all focus:w-56 focus:border-brand focus:bg-white sm:w-48 sm:focus:w-64"
      />
      <Search
        size={14}
        strokeWidth={2.25}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-data-[transparent=true]/nav:text-white/80"
      />
    </form>
  );
}
