"use client";

import { useState } from "react";

interface ProductAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ProductAccordion({
  title,
  children,
  defaultOpen = false,
}: ProductAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[var(--gold)]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--gold)] group-hover:text-[var(--foreground)] transition-colors">
          {title}
        </h3>
        <div
          className={`w-5 h-5 flex items-center justify-center transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-4 h-4 text-[var(--gold)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
