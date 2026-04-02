"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductViewToggle({ currentView }: { currentView: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center border border-[var(--gold)]/20 overflow-hidden">
      <button
        onClick={() => setView("spreadsheet")}
        className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.1em] uppercase transition-colors ${
          currentView === "spreadsheet"
            ? "bg-[var(--gold)]/10 text-[var(--gold)]"
            : "text-[var(--foreground)]/60 hover:bg-[var(--background)]"
        }`}
        title="Spreadsheet view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span className="hidden sm:inline">Spreadsheet</span>
      </button>
      <div className="w-px h-6 bg-[var(--gold)]/20" />
      <button
        onClick={() => setView("cards")}
        className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.1em] uppercase transition-colors ${
          currentView === "cards"
            ? "bg-[var(--gold)]/10 text-[var(--gold)]"
            : "text-[var(--foreground)]/60 hover:bg-[var(--background)]"
        }`}
        title="Card view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
