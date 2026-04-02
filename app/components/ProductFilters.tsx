"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import AIStylistModal from "./AIStylistModal";

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
  userTier?: number;
};

// Category icons as SVG components
const TopIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M32 8L20 16V24L12 28V48L20 52V56H44V52L52 48V28L44 24V16L32 8Z" />
    <path d="M20 16L32 24L44 16" />
    <path d="M32 24V40" />
  </svg>
);

const JacketIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M32 8L18 14V20L8 24V52H24V44H40V52H56V24L46 20V14L32 8Z" />
    <path d="M18 14L32 22L46 14" />
    <path d="M24 22V36" />
    <path d="M40 22V36" />
  </svg>
);

const BottomsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M18 12H46V20L42 56H36L32 32L28 56H22L18 20V12Z" />
    <path d="M18 20H46" />
  </svg>
);

const ShoesIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 36L12 28L24 24L32 20L44 24L52 32L56 40V48H8V36Z" />
    <path d="M8 40H56" />
    <ellipse cx="44" cy="32" rx="6" ry="4" />
  </svg>
);

const DressIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M32 8L24 12V18L16 24L12 56H52L48 24L40 18V12L32 8Z" />
    <path d="M24 18H40" />
    <path d="M20 36H44" />
    <path d="M32 18V36" />
  </svg>
);

const AccessoriesIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="32" cy="32" r="16" />
    <circle cx="32" cy="32" r="8" />
    <path d="M32 16V8" />
    <path d="M32 56V48" />
    <path d="M16 32H8" />
    <path d="M56 32H48" />
  </svg>
);

const categories = [
  { id: "tops", label: "Tops", icon: TopIcon },
  { id: "jackets", label: "Jackets", icon: JacketIcon },
  { id: "dresses", label: "Dresses", icon: DressIcon },
  { id: "bottoms", label: "Bottoms", icon: BottomsIcon },
  { id: "shoes", label: "Shoes", icon: ShoesIcon },
  { id: "accessories", label: "Accessories", icon: AccessoriesIcon },
];

const colorOptions = [
  { id: "black", label: "Black", hex: "#1A1A1A" },
  { id: "white", label: "White", hex: "#FAFAFA" },
  { id: "red", label: "Red", hex: "#8B2942" },
  { id: "blue", label: "Blue", hex: "#2E4A6B" },
  { id: "green", label: "Green", hex: "#4A5D4A" },
  { id: "brown", label: "Brown", hex: "#6B4A3A" },
  { id: "beige", label: "Beige", hex: "#C4B49A" },
  { id: "gold", label: "Gold", hex: "#B8A06A" },
  { id: "silver", label: "Silver", hex: "#A8A8A8" },
  { id: "pink", label: "Pink", hex: "#D4A5A5" },
  { id: "purple", label: "Purple", hex: "#6B4A6B" },
  { id: "navy", label: "Navy", hex: "#1A2A4A" },
];

// Type for category colors map
type CategoryColors = Record<string, string[]>;

// Parse colors from URL format: "tops:black,red;bottoms:blue,white"
function parseColorsFromUrl(colorString: string | null): CategoryColors {
  if (!colorString) return {};
  const result: CategoryColors = {};
  const parts = colorString.split(";");
  for (const part of parts) {
    const [category, colors] = part.split(":");
    if (category && colors) {
      result[category] = colors.split(",").filter(Boolean);
    }
  }
  return result;
}

// Convert colors map to URL format
function colorsToUrlString(colors: CategoryColors): string {
  const parts: string[] = [];
  for (const [category, colorList] of Object.entries(colors)) {
    if (colorList.length > 0) {
      parts.push(`${category}:${colorList.join(",")}`);
    }
  }
  return parts.join(";");
}

export default function ProductFilters({ filterOptions, userTier = 0 }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<CategoryColors>({});
  const [aiStylistOpen, setAiStylistOpen] = useState(false);

  // Sync from URL on mount and when searchParams change
  useEffect(() => {
    const categoriesFromUrl = searchParams.get("category");
    if (categoriesFromUrl) {
      setSelectedCategories(categoriesFromUrl.split(","));
    } else {
      setSelectedCategories([]);
    }

    const colorsFromUrl = searchParams.get("colors");
    setCategoryColors(parseColorsFromUrl(colorsFromUrl));
  }, [searchParams]);

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Already selected - open color dialog for this category
      setDialogCategory(categoryId);
      setColorDialogOpen(true);
    } else {
      // Add category and open color dialog
      const newCategories = [...selectedCategories, categoryId];
      setSelectedCategories(newCategories);
      setDialogCategory(categoryId);

      const categoryParam = newCategories.join(",");
      router.push(`/storefront?${createQueryString({ category: categoryParam })}`);
      setColorDialogOpen(true);
    }
  };

  const handleCategoryRemove = (categoryId: string) => {
    const newCategories = selectedCategories.filter(c => c !== categoryId);
    setSelectedCategories(newCategories);

    // Also remove colors for this category
    const newCategoryColors = { ...categoryColors };
    delete newCategoryColors[categoryId];
    setCategoryColors(newCategoryColors);

    const categoryParam = newCategories.length > 0 ? newCategories.join(",") : "";
    const colorsParam = colorsToUrlString(newCategoryColors);

    router.push(`/storefront?${createQueryString({
      category: categoryParam,
      colors: colorsParam
    })}`);
  };

  const handleColorToggle = (colorId: string) => {
    if (!dialogCategory) return;

    const currentColors = categoryColors[dialogCategory] || [];
    let newColors: string[];

    if (currentColors.includes(colorId)) {
      newColors = currentColors.filter(c => c !== colorId);
    } else {
      newColors = [...currentColors, colorId];
    }

    const newCategoryColors = { ...categoryColors };
    if (newColors.length > 0) {
      newCategoryColors[dialogCategory] = newColors;
    } else {
      delete newCategoryColors[dialogCategory];
    }
    setCategoryColors(newCategoryColors);

    const colorsParam = colorsToUrlString(newCategoryColors);
    router.push(`/storefront?${createQueryString({ colors: colorsParam })}`);
  };

  const clearColorsForCategory = () => {
    if (!dialogCategory) return;

    const newCategoryColors = { ...categoryColors };
    delete newCategoryColors[dialogCategory];
    setCategoryColors(newCategoryColors);

    const colorsParam = colorsToUrlString(newCategoryColors);
    router.push(`/storefront?${createQueryString({ colors: colorsParam })}`);
  };

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/storefront?${createQueryString({ [name]: value })}`);
  };

  const clearAllFilters = () => {
    router.push("/storefront");
    setSelectedCategories([]);
    setCategoryColors({});
  };

  const hasActiveFilters =
    searchParams.get("designer") ||
    searchParams.get("era") ||
    searchParams.get("size") ||
    searchParams.get("colors") ||
    searchParams.get("material") ||
    searchParams.get("category");

  // Get colors for current dialog category
  const currentCategoryColors = dialogCategory ? (categoryColors[dialogCategory] || []) : [];

  return (
    <>
      <div className="w-full">
        {/* Single Row Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
          {/* Category Icons */}
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategories.includes(category.id);
            const colorCount = (categoryColors[category.id] || []).length;
            return (
              <div key={category.id} className="relative">
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`group flex items-center gap-1.5 px-3 py-2 border transition-luxury ${
                    isActive
                      ? "border-[var(--wine)] bg-[var(--wine)]/5 text-[var(--wine)]"
                      : "border-[var(--gold)]/20 text-[var(--foreground)]/60 hover:border-[var(--gold)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon />
                  <span className="text-[10px] lg:text-xs tracking-[0.08em] uppercase">
                    {category.label}
                  </span>
                  {isActive && colorCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[var(--wine)] text-[#F5F0E8] text-xs flex items-center justify-center">
                      {colorCount}
                    </span>
                  )}
                </button>
                {/* Remove button for active categories */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryRemove(category.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--wine)] text-[#F5F0E8] flex items-center justify-center hover:bg-[var(--foreground)] transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          {/* Divider */}
          <div className="hidden lg:block w-px h-8 bg-[var(--gold)]/20" />

          {/* AI Stylist Button */}
          <button
            onClick={() => setAiStylistOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-[var(--gold)] bg-[var(--gold)]/5 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--espresso)] transition-luxury"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            <span className="text-[10px] lg:text-xs tracking-[0.08em] uppercase">AI Stylist</span>
          </button>

          {/* Divider */}
          <div className="hidden lg:block w-px h-8 bg-[var(--gold)]/20" />

          {/* Designer Filter */}
          {filterOptions.designers.length > 0 && (
            <select
              value={searchParams.get("designer") || ""}
              onChange={(e) => handleFilterChange("designer", e.target.value)}
              className="px-3 py-2 bg-transparent border border-[var(--gold)]/20 text-xs text-[var(--foreground)] font-editorial focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer appearance-none pr-7"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23B8A06A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1rem",
              }}
            >
              <option value="">Designer</option>
              {filterOptions.designers.map((designer) => (
                <option key={designer.id} value={designer.id}>
                  {designer.name}
                </option>
              ))}
            </select>
          )}

          {/* Era Filter */}
          {filterOptions.eras.length > 0 && (
            <select
              value={searchParams.get("era") || ""}
              onChange={(e) => handleFilterChange("era", e.target.value)}
              className="px-3 py-2 bg-transparent border border-[var(--gold)]/20 text-xs text-[var(--foreground)] font-editorial focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer appearance-none pr-7"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23B8A06A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1rem",
              }}
            >
              <option value="">Era</option>
              {filterOptions.eras.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          )}

          {/* Size Filter */}
          {filterOptions.sizes.length > 0 && (
            <select
              value={searchParams.get("size") || ""}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              className="px-3 py-2 bg-transparent border border-[var(--gold)]/20 text-xs text-[var(--foreground)] font-editorial focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer appearance-none pr-7"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23B8A06A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1rem",
              }}
            >
              <option value="">Size</option>
              {filterOptions.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          )}

          {/* Material Filter */}
          {filterOptions.materials.length > 0 && (
            <select
              value={searchParams.get("material") || ""}
              onChange={(e) => handleFilterChange("material", e.target.value)}
              className="px-3 py-2 bg-transparent border border-[var(--gold)]/20 text-xs text-[var(--foreground)] font-editorial focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer appearance-none pr-7"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23B8A06A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1rem",
              }}
            >
              <option value="">Material</option>
              {filterOptions.materials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-[10px] lg:text-xs tracking-[0.08em] uppercase text-[var(--wine)] border border-[var(--wine)]/30 hover:bg-[var(--wine)] hover:text-[#F5F0E8] transition-luxury"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* AI Stylist Modal */}
      <AIStylistModal
        isOpen={aiStylistOpen}
        onClose={() => setAiStylistOpen(false)}
        userTier={userTier}
      />

      {/* Color Selection Dialog */}
      {colorDialogOpen && dialogCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setColorDialogOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[var(--espresso)]/60 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative bg-[var(--background)] border border-[var(--gold)]/20 p-8 max-w-md w-full mx-4 shadow-luxury"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setColorDialogOpen(false)}
              className="absolute top-4 right-4 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase mb-2">
                {categories.find(c => c.id === dialogCategory)?.label}
              </p>
              <h3 className="font-display text-2xl text-[var(--foreground)]">
                Select Colors
              </h3>
              <p className="text-[var(--foreground)]/50 text-sm mt-1 font-editorial">
                Tap to select multiple colors
              </p>
              <div className="rule-gold w-12 mx-auto mt-4" />
            </div>

            {/* Selected Colors Summary */}
            {currentCategoryColors.length > 0 && (
              <div className="mb-6 p-4 bg-[var(--background-deep)] border border-[var(--gold)]/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-[0.1em] uppercase text-[var(--foreground)]/60">
                    Selected ({currentCategoryColors.length})
                  </span>
                  <button
                    onClick={clearColorsForCategory}
                    className="text-xs tracking-[0.1em] uppercase text-[var(--wine)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentCategoryColors.map((colorId) => {
                    const color = colorOptions.find(c => c.id === colorId);
                    if (!color) return null;
                    return (
                      <button
                        key={colorId}
                        onClick={() => handleColorToggle(colorId)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--background)] border border-[var(--gold)]/20 text-xs text-[var(--foreground)] hover:border-[var(--wine)] transition-colors group"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[var(--foreground)]/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.label}
                        <svg className="w-3 h-3 text-[var(--foreground)]/40 group-hover:text-[var(--wine)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Grid */}
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => {
                const isSelected = currentCategoryColors.includes(color.id);
                return (
                  <button
                    key={color.id}
                    onClick={() => handleColorToggle(color.id)}
                    className={`group flex flex-col items-center gap-2 p-3 transition-luxury ${
                      isSelected
                        ? "bg-[var(--background-deep)]"
                        : "hover:bg-[var(--background-deep)]"
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition-luxury ${
                          isSelected
                            ? "border-[var(--wine)] scale-110"
                            : "border-[var(--gold)]/30 group-hover:border-[var(--gold)]"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs tracking-wide ${
                      isSelected
                        ? "text-[var(--wine)]"
                        : "text-[var(--foreground)]/60"
                    }`}>
                      {color.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Done Button */}
            <button
              onClick={() => setColorDialogOpen(false)}
              className="w-full mt-6 py-3 bg-[var(--espresso)] text-[#F5F0E8] text-xs tracking-[0.15em] uppercase hover:bg-[var(--wine)] transition-luxury"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
