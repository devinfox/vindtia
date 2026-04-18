"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

type Designer = { id: string; name: string };
type ProductStyle = "masculine" | "feminine" | "unisex";

type MediaItem = {
  id?: string;
  url: string;
  sort_order: number;
  isUploading?: boolean;
  file?: File;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  designer_id: string | null;
  description: string | null;
  ai_description: string | null;
  price_per_rental: number;
  size: string | null;
  color: string | null;
  category: string | null;
  condition: string | null;
  era: string | null;
  material: string | null;
  style: ProductStyle;
  archive: boolean;
  tier_required: number;
  media?: { id: string; url: string; sort_order: number }[];
  inventory?: { id: string; quantity: number }[];
  designer?: { id: string; name: string } | null;
};

type ProductSpreadsheetProps = {
  initialProducts: Product[];
  initialDesigners: Designer[];
};

// Options for dropdowns
const colorOptions = [
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
  { id: "red", label: "Red" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "brown", label: "Brown" },
  { id: "beige", label: "Beige" },
  { id: "gold", label: "Gold" },
  { id: "silver", label: "Silver" },
  { id: "pink", label: "Pink" },
  { id: "purple", label: "Purple" },
  { id: "navy", label: "Navy" },
];

const categoryOptions = [
  { id: "tops", label: "Tops" },
  { id: "jackets", label: "Jackets" },
  { id: "bottoms", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
  { id: "dresses", label: "Dresses" },
  { id: "accessories", label: "Accessories" },
];

const sizeOptions = [
  { id: "XS", label: "XS" },
  { id: "S", label: "S" },
  { id: "M", label: "M" },
  { id: "L", label: "L" },
  { id: "XL", label: "XL" },
  { id: "XXL", label: "XXL" },
  { id: "One Size", label: "One Size" },
];

const materialOptions = [
  { id: "silk", label: "Silk" },
  { id: "cashmere", label: "Cashmere" },
  { id: "wool", label: "Wool" },
  { id: "cotton", label: "Cotton" },
  { id: "linen", label: "Linen" },
  { id: "leather", label: "Leather" },
  { id: "velvet", label: "Velvet" },
  { id: "satin", label: "Satin" },
  { id: "lace", label: "Lace" },
  { id: "denim", label: "Denim" },
  { id: "polyester", label: "Polyester" },
  { id: "mixed", label: "Mixed Fabrics" },
];

const eraOptions = [
  { id: "1920s", label: "1920s" },
  { id: "1930s", label: "1930s" },
  { id: "1940s", label: "1940s" },
  { id: "1950s", label: "1950s" },
  { id: "1960s", label: "1960s" },
  { id: "1970s", label: "1970s" },
  { id: "1980s", label: "1980s" },
  { id: "1990s", label: "1990s" },
  { id: "2000s", label: "2000s" },
  { id: "2010s", label: "2010s" },
  { id: "Contemporary", label: "Contemporary" },
];

const conditionOptions = [
  { id: "Excellent", label: "Excellent" },
  { id: "Very Good", label: "Very Good" },
  { id: "Good", label: "Good" },
  { id: "Fair", label: "Fair" },
];

const styleOptions = [
  { id: "unisex", label: "Unisex" },
  { id: "feminine", label: "Feminine" },
  { id: "masculine", label: "Masculine" },
];

const tierOptions = [
  { id: "0", label: "Tier 0 (Free)" },
  { id: "1", label: "Tier 1" },
  { id: "2", label: "Tier 2" },
  { id: "3", label: "Tier 3" },
];

// Designer dropdown with search and "Add New" option
function DesignerDropdown({
  value,
  designers,
  onChange,
  onAddNew,
}: {
  value: string | null;
  designers: Designer[];
  onChange: (id: string | null) => void;
  onAddNew: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDesigner = designers.find((d) => d.id === value);

  const filteredDesigners = designers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 text-left text-sm bg-transparent border border-transparent hover:border-[var(--gold)]/30 focus:outline-none focus:border-[var(--gold)] transition-colors truncate"
      >
        {selectedDesigner?.name || <span className="text-[var(--foreground)]/40">Select...</span>}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-[var(--background)] border border-[var(--gold)]/30 shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[var(--gold)]/10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designers..."
              className="w-full px-3 py-2 text-sm bg-[var(--background-warm)] border border-[var(--gold)]/20 focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
                setSearch("");
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--gold)]/10 transition-colors ${
                !value ? "bg-[var(--gold)]/5 text-[var(--gold)]" : "text-[var(--foreground)]/60"
              }`}
            >
              <em>None</em>
            </button>

            {filteredDesigners.map((designer) => (
              <button
                key={designer.id}
                type="button"
                onClick={() => {
                  onChange(designer.id);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--gold)]/10 transition-colors ${
                  value === designer.id
                    ? "bg-[var(--gold)]/5 text-[var(--gold)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {designer.name}
              </button>
            ))}

            {filteredDesigners.length === 0 && search && (
              <div className="px-3 py-2 text-sm text-[var(--foreground)]/40 italic">
                No designers match "{search}"
              </div>
            )}
          </div>

          <div className="border-t border-[var(--gold)]/10 p-2">
            <button
              type="button"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
                setSearch("");
              }}
              className="w-full px-3 py-2 text-sm text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Designer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple dropdown for other fields
function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Select...",
}: {
  value: string | null;
  options: { id: string; label: string }[];
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 text-left text-sm bg-transparent border border-transparent hover:border-[var(--gold)]/30 focus:outline-none focus:border-[var(--gold)] transition-colors truncate"
      >
        {selectedOption?.label || <span className="text-[var(--foreground)]/40">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-40 bg-[var(--background)] border border-[var(--gold)]/30 shadow-xl max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--gold)]/10 transition-colors ${
              !value ? "bg-[var(--gold)]/5 text-[var(--gold)]" : "text-[var(--foreground)]/60"
            }`}
          >
            <em>None</em>
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--gold)]/10 transition-colors ${
                value === option.id
                  ? "bg-[var(--gold)]/5 text-[var(--gold)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Image cell with drag-drop, preview, and reorder
function ImageCell({
  productId,
  mediaItems,
  onMediaChange,
}: {
  productId: string;
  mediaItems: MediaItem[];
  onMediaChange: (items: MediaItem[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<MediaItem[]>(mediaItems);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const localItemsRef = useRef<MediaItem[]>(localItems);

  // Keep ref in sync
  useEffect(() => {
    localItemsRef.current = localItems;
  }, [localItems]);

  // Sync local items with props when props change (but not during upload)
  useEffect(() => {
    if (!isUploading) {
      setLocalItems(mediaItems);
    }
  }, [mediaItems, isUploading]);

  // Notify parent when pending sync is triggered
  useEffect(() => {
    if (pendingSync) {
      onMediaChange(localItemsRef.current);
      setPendingSync(false);
    }
  }, [pendingSync, onMediaChange]);

  // Notify parent when local items change (for user actions)
  const updateItems = useCallback((newItems: MediaItem[]) => {
    setLocalItems(newItems);
    localItemsRef.current = newItems;
    // Defer the parent notification to avoid setState during render
    setTimeout(() => onMediaChange(newItems), 0);
  }, [onMediaChange]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Natural sort function for filenames (so "2.jpg" comes before "10.jpg")
  const naturalSort = (a: File, b: File) => {
    // Use webkitRelativePath if available (folder upload), otherwise use name
    const aPath = (a as any).webkitRelativePath || a.name;
    const bPath = (b as any).webkitRelativePath || b.name;

    return aPath.localeCompare(bPath, undefined, { numeric: true, sensitivity: 'base' });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Convert FileList to array and filter for images
    const fileArray = Array.from(files)
      .filter(file => file.type.startsWith("image/"))
      .sort(naturalSort);

    const newItems: MediaItem[] = [];
    const startOrder = localItems.length;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      const tempUrl = URL.createObjectURL(file);
      newItems.push({
        url: tempUrl,
        sort_order: startOrder + i,
        isUploading: true,
        file,
      });
    }

    if (newItems.length === 0) {
      setIsUploading(false);
      return;
    }

    const updatedItems = [...localItems, ...newItems];
    setLocalItems(updatedItems);
    localItemsRef.current = updatedItems;
    setTimeout(() => onMediaChange(updatedItems), 0);

    // Upload files sequentially
    for (const item of newItems) {
      if (item.file) {
        const uploadedUrl = await uploadFile(item.file);

        // Update state and notify parent
        const currentItems = localItemsRef.current;
        const updated = [...currentItems];
        const index = updated.findIndex((p) => p.url === item.url);
        if (index !== -1) {
          if (uploadedUrl) {
            updated[index] = { ...updated[index], url: uploadedUrl, isUploading: false };
          } else {
            updated.splice(index, 1);
          }
        }
        setLocalItems(updated);
        localItemsRef.current = updated;
        setTimeout(() => onMediaChange(updated), 0);

        URL.revokeObjectURL(item.url);
      }
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeMedia = (index: number) => {
    const updated = localItems.filter((_, i) => i !== index);
    updated.forEach((item, i) => (item.sort_order = i));
    updateItems(updated);
  };

  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...localItems];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    updated.forEach((item, i) => (item.sort_order = i));
    updateItems(updated);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const sortedItems = useMemo(() =>
    [...localItems].sort((a, b) => a.sort_order - b.sort_order),
    [localItems]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentIndex > sortedItems.length) {
      setCurrentIndex(Math.max(0, sortedItems.length));
    }
  }, [sortedItems.length, currentIndex]);

  const isOnAddSlide = currentIndex === sortedItems.length;
  const currentImage = sortedItems[currentIndex];
  const totalSlides = sortedItems.length + 1; // +1 for the "add" slide

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < sortedItems.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative">
      {/* Compact view with navigation */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="w-4 h-20 flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors"
            title="Previous image"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {currentIndex === 0 && <div className="w-4" />}

        {/* Image display area */}
        <div
          onClick={() => !isOnAddSlide && sortedItems.length > 0 && setIsExpanded(true)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-16 h-20 border transition-colors flex items-center justify-center relative ${
            isDragging
              ? "border-[var(--gold)] bg-[var(--gold)]/10"
              : isOnAddSlide
              ? "border-dashed border-[var(--gold)]/40 hover:border-[var(--gold)] cursor-pointer"
              : "border-[var(--gold)]/20 hover:border-[var(--gold)]/40 cursor-pointer"
          }`}
        >
          {isOnAddSlide ? (
            // Add new image slide
            <div
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex flex-col items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--gold)] transition-colors w-full h-full"
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[8px] uppercase tracking-wide">Add</span>
            </div>
          ) : currentImage ? (
            <div className="relative w-full h-full">
              {currentImage.isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--background-deep)]">
                  <div className="w-4 h-4 border border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin" />
                </div>
              ) : (
                <Image
                  src={currentImage.url}
                  alt={`Image ${currentIndex + 1}`}
                  fill
                  className="object-cover"
                />
              )}
              {/* Image counter */}
              <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/60 text-white text-[9px] text-center">
                {currentIndex + 1} / {sortedItems.length}
              </div>
            </div>
          ) : (
            // No images yet
            <div
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex flex-col items-center justify-center text-[var(--foreground)]/30 text-xs text-center p-1 w-full h-full"
            >
              <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[8px]">Drop</span>
            </div>
          )}
        </div>

        {/* Next button */}
        {currentIndex < sortedItems.length && (
          <button
            onClick={goNext}
            className="w-4 h-20 flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors"
            title={currentIndex === sortedItems.length - 1 ? "Add image" : "Next image"}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {currentIndex >= sortedItems.length && <div className="w-4" />}
      </div>

      {/* Expanded view modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setIsExpanded(false)}>
          <div
            className="bg-[var(--background)] border border-[var(--gold)]/30 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm tracking-[0.15em] uppercase text-[var(--gold)]">
                Product Images
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-[var(--gold)]/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed p-4 text-center transition-colors mb-4 ${
                isDragging
                  ? "border-[var(--gold)] bg-[var(--gold)]/10"
                  : "border-[var(--gold)]/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleFileSelect(e.target.files);
                  e.target.value = ''; // Reset so same file can be selected again
                }}
                className="hidden"
              />
              <input
                ref={folderInputRef}
                type="file"
                accept="image/*"
                multiple
                {...{ webkitdirectory: "", directory: "" } as any}
                onChange={(e) => {
                  handleFileSelect(e.target.files);
                  e.target.value = ''; // Reset
                }}
                className="hidden"
              />
              <p className="text-sm text-[var(--foreground)]/60 mb-3">
                Drop images here, or:
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs border border-[var(--gold)]/30 text-[var(--foreground)]/70 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  Select Files
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs border border-[var(--gold)]/30 text-[var(--foreground)]/70 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  Select Folder
                </button>
              </div>
              <p className="text-[10px] text-[var(--foreground)]/40 mt-2">
                Folder uploads maintain filename order (1.jpg, 2.jpg, 10.jpg...)
              </p>
            </div>

            {/* Image grid */}
            {sortedItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {sortedItems.map((item, index) => (
                    <div
                      key={item.url}
                      draggable={!item.isUploading}
                      onDragStart={() => handleImageDragStart(index)}
                      onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragEnd={handleImageDragEnd}
                      className={`relative aspect-[3/4] bg-[var(--background-deep)] border cursor-move ${
                        draggedIndex === index
                          ? "border-[var(--gold)] opacity-50"
                          : "border-[var(--gold)]/10"
                      }`}
                    >
                      {item.isUploading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin" />
                        </div>
                      ) : (
                        <Image src={item.url} alt={`Image ${index + 1}`} fill className="object-cover" />
                      )}

                      {/* Order badge */}
                      <div className="absolute top-1 left-1 w-5 h-5 bg-[var(--espresso)] text-[var(--gold)] text-[10px] flex items-center justify-center">
                        {index + 1}
                      </div>

                      {/* Remove button */}
                      {!item.isUploading && (
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-[var(--wine)] text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {/* Featured badge */}
                      {index === 0 && !item.isUploading && (
                        <div className="absolute bottom-1 left-1 right-1 px-1 py-0.5 bg-[var(--gold)] text-[var(--espresso)] text-[8px] text-center uppercase">
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <p className="mt-4 text-xs text-[var(--foreground)]/50">
              Drag images to reorder. First image is the featured image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Editable text cell
function EditableCell({
  value,
  onChange,
  type = "text",
  placeholder = "",
  multiline = false,
}: {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  type?: "text" | "number";
  placeholder?: string;
  multiline?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value?.toString() || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value?.toString() || "");
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (type === "number") {
      const num = parseFloat(localValue);
      onChange(isNaN(num) ? null : num);
    } else {
      onChange(localValue || null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      (e.target as HTMLInputElement).blur();
    }
  };

  const baseStyles =
    "w-full px-2 py-1 text-sm bg-transparent border border-transparent hover:border-[var(--gold)]/30 focus:outline-none focus:border-[var(--gold)] focus:bg-[var(--background)] transition-colors";

  if (multiline) {
    return (
      <textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={2}
        className={`${baseStyles} resize-none`}
      />
    );
  }

  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={baseStyles}
    />
  );
}

// Checkbox cell
function CheckboxCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer px-2">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-4 h-4 border border-[var(--gold)]/30 bg-transparent peer-checked:bg-[var(--wine)] peer-checked:border-[var(--wine)] transition-colors flex items-center justify-center">
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      {label && <span className="text-xs text-[var(--foreground)]/60">{label}</span>}
    </label>
  );
}

// Row status indicator
function RowStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1">
      {status === "saving" && (
        <div className="w-3 h-3 border border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin" />
      )}
      {status === "saved" && (
        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "error" && (
        <svg className="w-3 h-3 text-[var(--wine)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
  );
}

// CSV Upload Modal
function CSVUploadModal({
  isOpen,
  onClose,
  onUpload,
  designers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (products: Partial<Product>[]) => void;
  designers: Designer[];
}) {
  const [csvData, setCsvData] = useState<string>("");
  const [parsedProducts, setParsedProducts] = useState<Partial<Product>[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    setError("");
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setError("CSV must have a header row and at least one data row");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    const products: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle quoted values with commas
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^["']|["']$/g, ""));

      if (values.length !== headers.length) continue;

      const product: Partial<Product> = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header) {
          case "sku":
          case "product sku":
          case "item sku":
            product.sku = value;
            break;
          case "name":
          case "product name":
          case "title":
            product.name = value;
            break;
          case "designer":
          case "designer name":
          case "brand":
            // Try to find designer by name
            const designer = designers.find(
              (d) => d.name.toLowerCase() === value.toLowerCase()
            );
            if (designer) {
              product.designer_id = designer.id;
            }
            break;
          case "price":
          case "price_per_rental":
          case "rental price":
          case "per week price ($)":
          case "per week price":
          case "weekly price":
            product.price_per_rental = parseFloat(value) || 0;
            break;
          case "description":
          case "notes":
            product.description = value;
            break;
          case "size":
            product.size = value;
            break;
          case "color":
          case "colour":
            product.color = value.toLowerCase();
            break;
          case "category":
          case "type":
            product.category = value.toLowerCase();
            break;
          case "condition":
            product.condition = value;
            break;
          case "era":
            product.era = value;
            break;
          case "material":
            product.material = value.toLowerCase();
            break;
          case "style":
            if (["masculine", "feminine", "unisex"].includes(value.toLowerCase())) {
              product.style = value.toLowerCase() as ProductStyle;
            }
            break;
          case "tier":
          case "tier_required":
            product.tier_required = parseInt(value) || 1;
            break;
        }
      });

      // If no name but we have description, use description as name
      if (!product.name && product.description) {
        product.name = product.description.substring(0, 100);
      }
      // If still no name but we have SKU, use SKU as name
      if (!product.name && product.sku) {
        product.name = product.sku;
      }

      // Auto-detect style from SKU prefix if not explicitly set
      // F = feminine, M = masculine
      if (!product.style && product.sku) {
        const skuPrefix = product.sku.charAt(0).toUpperCase();
        if (skuPrefix === "F") {
          product.style = "feminine";
        } else if (skuPrefix === "M") {
          product.style = "masculine";
        }
      }

      if (product.name) {
        products.push({
          ...product,
          sku: product.sku || null,
          price_per_rental: product.price_per_rental || 0,
          style: product.style || "unisex",
          tier_required: product.tier_required || 1,
          archive: false,
        });
      }
    }

    if (products.length === 0) {
      setError("No valid products found. Make sure CSV has a 'name' column.");
      return;
    }

    setParsedProducts(products);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvData(text);
    if (text.trim()) {
      parseCSV(text);
    } else {
      setParsedProducts([]);
    }
  };

  const handleUpload = () => {
    if (parsedProducts.length > 0) {
      onUpload(parsedProducts);
      setCsvData("");
      setParsedProducts([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--background)] border border-[var(--gold)]/30 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm tracking-[0.15em] uppercase text-[var(--gold)]">
            Import Products from CSV
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--gold)]/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs text-[var(--foreground)]/60 mb-2">
            Supported columns: name, designer, price, description, size, color, category, condition, era, material, style, tier
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs border border-[var(--gold)]/30 text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            Choose CSV File
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-[var(--foreground)]/60 mb-2">Or paste CSV data:</label>
          <textarea
            value={csvData}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-xs font-mono bg-[var(--background-warm)] border border-[var(--gold)]/20 focus:outline-none focus:border-[var(--gold)] transition-colors"
            placeholder="name,designer,price,category,size,color&#10;Vintage Silk Dress,Versace,150,dresses,M,black"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--wine)]/10 border border-[var(--wine)]/30 text-sm text-[var(--wine)]">
            {error}
          </div>
        )}

        {parsedProducts.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[var(--gold)] mb-2">
              Preview: {parsedProducts.length} products to import
            </p>
            <div className="max-h-40 overflow-y-auto border border-[var(--gold)]/10">
              <table className="w-full text-xs">
                <thead className="bg-[var(--background-warm)]">
                  <tr>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">Designer</th>
                    <th className="px-2 py-1 text-left">Price</th>
                    <th className="px-2 py-1 text-left">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedProducts.slice(0, 10).map((p, i) => (
                    <tr key={i} className="border-t border-[var(--gold)]/10">
                      <td className="px-2 py-1">{p.name}</td>
                      <td className="px-2 py-1 text-[var(--foreground)]/60">
                        {designers.find((d) => d.id === p.designer_id)?.name || "-"}
                      </td>
                      <td className="px-2 py-1">${p.price_per_rental}</td>
                      <td className="px-2 py-1">{p.category || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedProducts.length > 10 && (
                <p className="text-xs text-[var(--foreground)]/50 p-2">
                  ...and {parsedProducts.length - 10} more
                </p>
              )}
            </div>
            <p className="text-[10px] text-[var(--foreground)]/40 mt-2">
              Products will be created as drafts (no images). Add images to publish them.
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border border-[var(--gold)]/30 text-[var(--foreground)] hover:bg-[var(--background-warm)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={parsedProducts.length === 0}
            className="px-4 py-2 text-xs bg-[var(--wine)] text-white hover:bg-[var(--espresso)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Import {parsedProducts.length} Products
          </button>
        </div>
      </div>
    </div>
  );
}

// Draft status badge
function DraftBadge({ hasImages }: { hasImages: boolean }) {
  if (hasImages) return null;

  return (
    <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
      Draft
    </span>
  );
}

// Main spreadsheet component
export default function ProductSpreadsheet({
  initialProducts,
  initialDesigners,
}: ProductSpreadsheetProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [designers, setDesigners] = useState<Designer[]>(initialDesigners);
  const [rowStatuses, setRowStatuses] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [newProductData, setNewProductData] = useState<Partial<Product> & { mediaItems: MediaItem[] }>({
    name: "",
    designer_id: null,
    description: null,
    price_per_rental: 0,
    size: null,
    color: null,
    category: null,
    condition: null,
    era: null,
    material: null,
    style: "unisex",
    archive: false,
    tier_required: 1,
    mediaItems: [],
  });

  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Listen for new designers from other tabs
  useEffect(() => {
    const channel = new BroadcastChannel("vindtia-designers");

    channel.onmessage = (event) => {
      if (event.data.type === "designer-created") {
        setDesigners((prev) => {
          const exists = prev.some((d) => d.id === event.data.designer.id);
          if (exists) return prev;
          return [...prev, event.data.designer].sort((a, b) => a.name.localeCompare(b.name));
        });
      }
    };

    return () => channel.close();
  }, []);

  // Also poll for new designers periodically
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const res = await fetch("/api/admin/designers");
        if (res.ok) {
          const data = await res.json();
          setDesigners(data.sort((a: Designer, b: Designer) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error("Failed to fetch designers:", err);
      }
    };

    const interval = setInterval(fetchDesigners, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const debouncedSave = useCallback(
    (productId: string, updates: Partial<Product>, mediaItems?: MediaItem[]) => {
      // Clear existing timeout
      if (saveTimeouts.current[productId]) {
        clearTimeout(saveTimeouts.current[productId]);
      }

      setRowStatuses((prev) => ({ ...prev, [productId]: "saving" }));

      saveTimeouts.current[productId] = setTimeout(async () => {
        try {
          // Get the current product to include all required fields
          const currentProduct = products.find((p) => p.id === productId);
          if (!currentProduct) {
            throw new Error("Product not found");
          }

          const mediaUrls = mediaItems
            ?.filter((m) => !m.isUploading)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((m) => m.url);

          // Build full payload with current product data + updates
          const payload = {
            name: currentProduct.name,
            designer_id: currentProduct.designer_id,
            description: currentProduct.description,
            price_per_rental: currentProduct.price_per_rental,
            size: currentProduct.size,
            color: currentProduct.color,
            category: currentProduct.category,
            condition: currentProduct.condition,
            era: currentProduct.era,
            material: currentProduct.material,
            style: currentProduct.style,
            archive: currentProduct.archive,
            tier_required: currentProduct.tier_required,
            ...updates,
            ...(mediaUrls !== undefined ? { mediaUrls } : {}),
          };

          const res = await fetch(`/api/admin/products/${productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to save");
          }

          setRowStatuses((prev) => ({ ...prev, [productId]: "saved" }));

          // Reset status after 2 seconds
          setTimeout(() => {
            setRowStatuses((prev) => ({ ...prev, [productId]: "idle" }));
          }, 2000);
        } catch (err) {
          console.error("Save error:", err);
          setRowStatuses((prev) => ({ ...prev, [productId]: "error" }));
        }
      }, 800);
    },
    [products]
  );

  const updateProduct = useCallback(
    (productId: string, field: keyof Product, value: any) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const updated = { ...p, [field]: value };
          return updated;
        })
      );

      const product = products.find((p) => p.id === productId);
      if (product) {
        debouncedSave(productId, { [field]: value });
      }
    },
    [products, debouncedSave]
  );

  const updateProductMedia = useCallback(
    (productId: string, mediaItems: MediaItem[]) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            media: mediaItems.map((m, i) => ({
              id: m.id || `temp-${i}`,
              url: m.url,
              sort_order: i,
            })),
          };
        })
      );

      // Save after uploads complete
      const allUploaded = mediaItems.every((m) => !m.isUploading);
      if (allUploaded) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          debouncedSave(productId, {}, mediaItems);
        }
      }
    },
    [products, debouncedSave]
  );

  const handleAddNewDesigner = () => {
    window.open("/admin/designers/new", "_blank");
  };

  const createProduct = async () => {
    if (!newProductData.name?.trim()) return;

    setIsCreating(true);

    try {
      const mediaUrls = newProductData.mediaItems
        ?.filter((m) => !m.isUploading)
        .map((m) => m.url);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProductData.name,
          designer_id: newProductData.designer_id || null,
          description: newProductData.description || null,
          price_per_rental: newProductData.price_per_rental || 0,
          size: newProductData.size || null,
          color: newProductData.color || null,
          category: newProductData.category || null,
          condition: newProductData.condition || null,
          era: newProductData.era || null,
          material: newProductData.material || null,
          style: newProductData.style || "unisex",
          archive: newProductData.archive || false,
          tier_required: newProductData.tier_required || 1,
          quantity: 1,
          mediaUrls: mediaUrls || [],
        }),
      });

      if (!res.ok) throw new Error("Failed to create product");

      const created = await res.json();

      // Add to products list
      setProducts((prev) => [created, ...prev]);

      // Reset form
      setNewProductData({
        name: "",
        designer_id: null,
        description: null,
        price_per_rental: 0,
        size: null,
        color: null,
        category: null,
        condition: null,
        era: null,
        material: null,
        style: "unisex",
        archive: false,
        tier_required: 1,
        mediaItems: [],
      });
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Bulk create products from CSV
  const bulkCreateProducts = async (productsToCreate: Partial<Product>[]) => {
    setIsCreating(true);

    const created: Product[] = [];

    for (const productData of productsToCreate) {
      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: productData.name,
            designer_id: productData.designer_id || null,
            description: productData.description || null,
            price_per_rental: productData.price_per_rental || 0,
            size: productData.size || null,
            color: productData.color || null,
            category: productData.category || null,
            condition: productData.condition || null,
            era: productData.era || null,
            material: productData.material || null,
            style: productData.style || "unisex",
            archive: false,
            tier_required: productData.tier_required || 1,
            quantity: 1,
            mediaUrls: [],
          }),
        });

        if (res.ok) {
          const product = await res.json();
          created.push(product);
        }
      } catch (err) {
        console.error("Failed to create product:", productData.name, err);
      }
    }

    // Add all created products to the list
    if (created.length > 0) {
      setProducts((prev) => [...created, ...prev]);
    }

    setIsCreating(false);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const draftCount = products.filter((p) => !p.media || p.media.length === 0).length;
  const publishedCount = products.length - draftCount;

  return (
    <div className="bg-[var(--background)] border border-[var(--gold)]/10 overflow-hidden">
      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={bulkCreateProducts}
        designers={designers}
      />

      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--gold)]/10 bg-[var(--background-warm)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xs tracking-[0.15em] uppercase text-[var(--gold)]">
              Product Spreadsheet
            </h2>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[var(--foreground)]/50">{publishedCount} published</span>
              {draftCount > 0 && (
                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                  {draftCount} drafts
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-3 py-1.5 text-[10px] tracking-wider uppercase border border-[var(--gold)]/30 text-[var(--foreground)]/70 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--background-warm)] border-b border-[var(--gold)]/10">
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-20">
                Image
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal min-w-[150px]">
                Name
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal min-w-[140px]">
                Designer
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-20">
                Price
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-24">
                Category
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-20">
                Size
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-20">
                Color
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-24">
                Material
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-24">
                Era
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-24">
                Condition
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-20">
                Style
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-20">
                Tier
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-16">
                Archive
              </th>
              <th className="px-2 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal min-w-[150px]">
                Description
              </th>
              <th className="px-2 py-3 text-center text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]/60 font-normal w-16">
                Status
              </th>
              <th className="px-2 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {/* New product row */}
            <tr className="border-b border-[var(--gold)]/20 bg-[var(--gold)]/5">
              <td className="px-2 py-2">
                <ImageCell
                  productId="new"
                  mediaItems={newProductData.mediaItems || []}
                  onMediaChange={(items) =>
                    setNewProductData((prev) => ({ ...prev, mediaItems: items }))
                  }
                />
              </td>
              <td className="px-2 py-2">
                <EditableCell
                  value={newProductData.name || ""}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, name: v as string }))}
                  placeholder="New product name..."
                />
              </td>
              <td className="px-2 py-2">
                <DesignerDropdown
                  value={newProductData.designer_id || null}
                  designers={designers}
                  onChange={(id) => setNewProductData((prev) => ({ ...prev, designer_id: id }))}
                  onAddNew={handleAddNewDesigner}
                />
              </td>
              <td className="px-2 py-2">
                <EditableCell
                  value={newProductData.price_per_rental || 0}
                  onChange={(v) =>
                    setNewProductData((prev) => ({ ...prev, price_per_rental: v as number }))
                  }
                  type="number"
                  placeholder="0"
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.category || null}
                  options={categoryOptions}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, category: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.size || null}
                  options={sizeOptions}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, size: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.color || null}
                  options={colorOptions}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, color: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.material || null}
                  options={materialOptions}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, material: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.era || null}
                  options={eraOptions}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, era: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.condition || null}
                  options={conditionOptions}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, condition: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={newProductData.style || "unisex"}
                  options={styleOptions}
                  onChange={(v) =>
                    setNewProductData((prev) => ({ ...prev, style: (v || "unisex") as ProductStyle }))
                  }
                />
              </td>
              <td className="px-2 py-2">
                <SelectDropdown
                  value={String(newProductData.tier_required || 1)}
                  options={tierOptions}
                  onChange={(v) =>
                    setNewProductData((prev) => ({ ...prev, tier_required: parseInt(v || "1") }))
                  }
                />
              </td>
              <td className="px-2 py-2">
                <CheckboxCell
                  checked={newProductData.archive || false}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, archive: v }))}
                />
              </td>
              <td className="px-2 py-2">
                <EditableCell
                  value={newProductData.description || ""}
                  onChange={(v) => setNewProductData((prev) => ({ ...prev, description: v as string }))}
                  placeholder="Description..."
                  multiline
                />
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  onClick={createProduct}
                  disabled={isCreating || !newProductData.name?.trim()}
                  className="px-3 py-1 bg-[var(--wine)] text-white text-[10px] tracking-wider uppercase hover:bg-[var(--espresso)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? "..." : "Add"}
                </button>
              </td>
              <td></td>
            </tr>

            {/* Existing products */}
            {products.map((product) => {
              const mediaItems: MediaItem[] =
                product.media?.map((m) => ({
                  id: m.id,
                  url: m.url,
                  sort_order: m.sort_order,
                })) || [];

              return (
                <tr
                  key={product.id}
                  className="border-b border-[var(--gold)]/10 hover:bg-[var(--background-warm)]/50 transition-colors"
                >
                  <td className="px-2 py-2">
                    <ImageCell
                      productId={product.id}
                      mediaItems={mediaItems}
                      onMediaChange={(items) => updateProductMedia(product.id, items)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={product.name}
                        onChange={(v) => updateProduct(product.id, "name", v)}
                        placeholder="Product name..."
                      />
                      <DraftBadge hasImages={mediaItems.length > 0} />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <DesignerDropdown
                      value={product.designer_id}
                      designers={designers}
                      onChange={(id) => updateProduct(product.id, "designer_id", id)}
                      onAddNew={handleAddNewDesigner}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <EditableCell
                      value={product.price_per_rental}
                      onChange={(v) => updateProduct(product.id, "price_per_rental", v)}
                      type="number"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.category}
                      options={categoryOptions}
                      onChange={(v) => updateProduct(product.id, "category", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.size}
                      options={sizeOptions}
                      onChange={(v) => updateProduct(product.id, "size", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.color}
                      options={colorOptions}
                      onChange={(v) => updateProduct(product.id, "color", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.material}
                      options={materialOptions}
                      onChange={(v) => updateProduct(product.id, "material", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.era}
                      options={eraOptions}
                      onChange={(v) => updateProduct(product.id, "era", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.condition}
                      options={conditionOptions}
                      onChange={(v) => updateProduct(product.id, "condition", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={product.style}
                      options={styleOptions}
                      onChange={(v) => updateProduct(product.id, "style", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectDropdown
                      value={String(product.tier_required)}
                      options={tierOptions}
                      onChange={(v) => updateProduct(product.id, "tier_required", parseInt(v || "1"))}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <CheckboxCell
                      checked={product.archive}
                      onChange={(v) => updateProduct(product.id, "archive", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <EditableCell
                      value={product.description}
                      onChange={(v) => updateProduct(product.id, "description", v)}
                      placeholder="Description..."
                      multiline
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <RowStatus status={rowStatuses[product.id] || "idle"} />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1 text-[var(--foreground)]/40 hover:text-[var(--wine)] transition-colors"
                      title="Delete product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-[var(--foreground)]/50 italic">
            No products yet. Add your first product using the row above.
          </p>
        </div>
      )}
    </div>
  );
}
