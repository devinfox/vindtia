import DesignerForm from "@/components/admin/DesignerForm";
import Link from "next/link";

export default function NewDesignerPage() {
  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="mb-10">
        <Link
          href="/admin/designers"
          className="inline-flex items-center gap-2 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors text-sm mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-editorial italic">Back to Designers</span>
        </Link>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
          <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
            Collection
          </p>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
          Add New Designer
        </h1>
      </div>

      {/* Form */}
      <DesignerForm />
    </div>
  );
}
