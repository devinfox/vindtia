"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type FilterOptions = {
  designers: { id: string; name: string }[];
  eras: string[];
  sizes: string[];
  colors: string[];
  materials: string[];
  categories: string[];
};

type ProductFiltersProps = {
  filterOptions: FilterOptions;
};

export default function ProductFilters({ filterOptions }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/storefront?${createQueryString(name, value)}`);
  };

  const clearAllFilters = () => {
    router.push("/storefront");
  };

  const hasActiveFilters =
    searchParams.get("designer") ||
    searchParams.get("era") ||
    searchParams.get("size") ||
    searchParams.get("color") ||
    searchParams.get("material") ||
    searchParams.get("category");

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-black dark:text-white uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-600 dark:text-red-500 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Designer Filter */}
      {filterOptions.designers.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Designer
          </label>
          <select
            value={searchParams.get("designer") || ""}
            onChange={(e) => handleFilterChange("designer", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">All Designers</option>
            {filterOptions.designers.map((designer) => (
              <option key={designer.id} value={designer.id}>
                {designer.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Era Filter */}
      {filterOptions.eras.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Era
          </label>
          <select
            value={searchParams.get("era") || ""}
            onChange={(e) => handleFilterChange("era", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">All Eras</option>
            {filterOptions.eras.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Size Filter */}
      {filterOptions.sizes.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((size) => (
              <button
                key={size}
                onClick={() =>
                  handleFilterChange(
                    "size",
                    searchParams.get("size") === size ? "" : size
                  )
                }
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  searchParams.get("size") === size
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {filterOptions.colors.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Color
          </label>
          <select
            value={searchParams.get("color") || ""}
            onChange={(e) => handleFilterChange("color", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">All Colors</option>
            {filterOptions.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Material Filter */}
      {filterOptions.materials.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Material
          </label>
          <select
            value={searchParams.get("material") || ""}
            onChange={(e) => handleFilterChange("material", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">All Materials</option>
            {filterOptions.materials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Filter */}
      {filterOptions.categories.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
            Category
          </label>
          <select
            value={searchParams.get("category") || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
            Active filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {searchParams.get("designer") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-black dark:text-white">
                Designer
                <button
                  onClick={() => handleFilterChange("designer", "")}
                  className="ml-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {searchParams.get("era") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-black dark:text-white">
                {searchParams.get("era")}
                <button
                  onClick={() => handleFilterChange("era", "")}
                  className="ml-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {searchParams.get("size") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-black dark:text-white">
                Size: {searchParams.get("size")}
                <button
                  onClick={() => handleFilterChange("size", "")}
                  className="ml-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {searchParams.get("color") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-black dark:text-white">
                {searchParams.get("color")}
                <button
                  onClick={() => handleFilterChange("color", "")}
                  className="ml-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {searchParams.get("material") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-black dark:text-white">
                {searchParams.get("material")}
                <button
                  onClick={() => handleFilterChange("material", "")}
                  className="ml-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {searchParams.get("category") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-black dark:text-white">
                {searchParams.get("category")}
                <button
                  onClick={() => handleFilterChange("category", "")}
                  className="ml-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
