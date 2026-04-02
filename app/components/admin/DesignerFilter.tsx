"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Designer = {
  id: string;
  name: string;
};

type DesignerFilterProps = {
  designers: Designer[];
};

export default function DesignerFilter({ designers }: DesignerFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDesigner = searchParams.get("designer") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("designer", e.target.value);
    } else {
      params.delete("designer");
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <label className="text-sm text-zinc-600 dark:text-zinc-400">
        Filter by designer:
      </label>
      <select
        value={currentDesigner}
        onChange={handleChange}
        className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
      >
        <option value="">All designers</option>
        {designers.map((designer) => (
          <option key={designer.id} value={designer.id}>
            {designer.name}
          </option>
        ))}
      </select>
      {currentDesigner && (
        <Link
          href="/admin/products"
          className="text-sm text-red-600 dark:text-red-500 hover:underline"
        >
          Clear filter
        </Link>
      )}
    </div>
  );
}
