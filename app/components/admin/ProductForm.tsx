"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Designer = { id: string; name: string };
type ProductStyle = 'masculine' | 'feminine' | 'unisex';

type Product = {
  id: string;
  name: string;
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
  style?: ProductStyle;
  archive: boolean;
  tier_required: number;
  media?: { id: string; url: string; sort_order: number }[];
  inventory?: { id: string; quantity: number }[];
};

type ProductFormProps = {
  product?: Product;
  designers: Designer[];
};

type MediaItem = {
  url: string;
  isUploading?: boolean;
  file?: File;
};

// Matching the storefront filter options exactly
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
  { id: "unisex", label: "Unisex", description: "Suitable for any presentation" },
  { id: "feminine", label: "Feminine", description: "Feminine silhouette or styling" },
  { id: "masculine", label: "Masculine", description: "Masculine silhouette or styling" },
];

// Common input styles
const inputStyles = "w-full px-4 py-3 bg-[var(--background)] border border-[var(--gold)]/20 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[var(--gold)] transition-colors disabled:opacity-50";

const selectStyles = `${inputStyles} cursor-pointer appearance-none pr-10`;

const labelStyles = "block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/60 mb-2";

export default function ProductForm({ product, designers }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    designer_id: product?.designer_id || "",
    description: product?.description || "",
    price_per_rental: product?.price_per_rental || 0,
    size: product?.size || "",
    color: product?.color || "",
    category: product?.category || "",
    condition: product?.condition || "",
    era: product?.era || "",
    material: product?.material || "",
    style: product?.style || "unisex" as ProductStyle,
    archive: product?.archive || false,
    tier_required: product?.tier_required || 1,
    quantity: product?.inventory?.[0]?.quantity || 1,
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    product?.media?.sort((a, b) => a.sort_order - b.sort_order).map((m) => ({ url: m.url })) || []
  );

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      // Add placeholder with loading state
      const tempUrl = URL.createObjectURL(file);
      newItems.push({ url: tempUrl, isUploading: true, file });
    }

    setMediaItems((prev) => [...prev, ...newItems]);

    // Upload files
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      if (item.file) {
        const uploadedUrl = await uploadFile(item.file);

        setMediaItems((prev) => {
          const updated = [...prev];
          const index = prev.findIndex((p) => p.url === item.url);
          if (index !== -1) {
            if (uploadedUrl) {
              updated[index] = { url: uploadedUrl, isUploading: false };
            } else {
              // Remove failed upload
              updated.splice(index, 1);
              setError("Failed to upload one or more images");
            }
          }
          return updated;
        });

        // Revoke object URL
        URL.revokeObjectURL(item.url);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveMedia = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= mediaItems.length) return;

    setMediaItems((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if any uploads are still in progress
    if (mediaItems.some((item) => item.isUploading)) {
      setError("Please wait for all images to finish uploading");
      setLoading(false);
      return;
    }

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const method = product ? "PATCH" : "POST";

      // Get URLs from media items
      const mediaUrls = mediaItems.map((item) => item.url).filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mediaUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const selectArrowStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23B8A06A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundPosition: "right 0.75rem center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1rem",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--background-warm)] border border-[var(--gold)]/10 p-8 space-y-8"
    >
      {/* Section: Basic Info */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6 flex items-center gap-3">
          <span>Basic Information</span>
          <div className="flex-1 h-px bg-[var(--gold)]/20" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelStyles}>
              Product Name <span className="text-[var(--wine)]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              className={inputStyles}
              placeholder="e.g., Vintage Silk Evening Gown"
            />
          </div>

          <div>
            <label className={labelStyles}>Designer</label>
            <select
              value={formData.designer_id}
              onChange={(e) =>
                setFormData({ ...formData, designer_id: e.target.value })
              }
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select designer</option>
              {designers.map((designer) => (
                <option key={designer.id} value={designer.id}>
                  {designer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className={labelStyles}>Description / Notes</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={loading}
            rows={3}
            className={inputStyles}
            placeholder="Add notes about the piece (e.g., '1970s fur Gucci cropped jacket, with a slight grungey aesthetic')..."
          />
          <p className="text-xs text-[var(--foreground)]/40 mt-2">
            The AI will automatically analyze your images and notes to create a searchable description
          </p>
        </div>
      </div>

      {/* Section: Pricing & Inventory */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6 flex items-center gap-3">
          <span>Pricing & Inventory</span>
          <div className="flex-1 h-px bg-[var(--gold)]/20" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelStyles}>
              Price per Rental ($) <span className="text-[var(--wine)]">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.price_per_rental}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price_per_rental: parseFloat(e.target.value),
                })
              }
              required
              disabled={loading}
              className={inputStyles}
            />
          </div>

          <div>
            <label className={labelStyles}>
              Tier Required <span className="text-[var(--wine)]">*</span>
            </label>
            <select
              value={formData.tier_required}
              onChange={(e) =>
                setFormData({ ...formData, tier_required: parseInt(e.target.value) })
              }
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="0">Tier 0 (Free)</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
            </select>
          </div>

          <div>
            <label className={labelStyles}>
              Quantity <span className="text-[var(--wine)]">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              required
              disabled={loading}
              className={inputStyles}
            />
          </div>
        </div>
      </div>

      {/* Section: Product Details */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6 flex items-center gap-3">
          <span>Product Details</span>
          <div className="flex-1 h-px bg-[var(--gold)]/20" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className={labelStyles}>Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select category</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className={labelStyles}>Color</label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select color</option>
              {colorOptions.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.label}
                </option>
              ))}
            </select>
            {/* Color preview */}
            {formData.color && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-4 h-4 rounded-full border border-[var(--gold)]/30"
                  style={{
                    backgroundColor: colorOptions.find(c => c.id === formData.color)?.hex
                  }}
                />
                <span className="text-xs text-[var(--foreground)]/60">
                  {colorOptions.find(c => c.id === formData.color)?.label}
                </span>
              </div>
            )}
          </div>

          {/* Size */}
          <div>
            <label className={labelStyles}>Size</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select size</option>
              {sizeOptions.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className={labelStyles}>Material</label>
            <select
              value={formData.material}
              onChange={(e) =>
                setFormData({ ...formData, material: e.target.value })
              }
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select material</option>
              {materialOptions.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Era */}
          <div>
            <label className={labelStyles}>Era</label>
            <select
              value={formData.era}
              onChange={(e) => setFormData({ ...formData, era: e.target.value })}
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select era</option>
              {eraOptions.map((era) => (
                <option key={era.id} value={era.id}>
                  {era.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className={labelStyles}>Condition</label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              disabled={loading}
              className={selectStyles}
              style={selectArrowStyle}
            >
              <option value="">Select condition</option>
              {conditionOptions.map((cond) => (
                <option key={cond.id} value={cond.id}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Style Selection */}
        <div className="mt-6 pt-6 border-t border-[var(--gold)]/10">
          <label className={labelStyles}>Style Presentation</label>
          <p className="text-xs text-[var(--foreground)]/50 mb-4">
            This helps the AI stylist match products to users based on their style preferences
          </p>
          <div className="grid grid-cols-3 gap-4">
            {styleOptions.map((style) => (
              <label
                key={style.id}
                className={`relative flex flex-col p-4 border cursor-pointer transition-luxury ${
                  formData.style === style.id
                    ? "border-[var(--gold)] bg-[var(--gold)]/5"
                    : "border-[var(--gold)]/20 hover:border-[var(--gold)]/40"
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={style.id}
                  checked={formData.style === style.id}
                  onChange={(e) =>
                    setFormData({ ...formData, style: e.target.value as ProductStyle })
                  }
                  disabled={loading}
                  className="sr-only"
                />
                <span className="text-sm font-editorial text-[var(--foreground)]">
                  {style.label}
                </span>
                <span className="text-xs text-[var(--foreground)]/50 mt-1">
                  {style.description}
                </span>
                {formData.style === style.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-[var(--gold)] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[var(--espresso)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Media */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6 flex items-center gap-3">
          <span>Product Images</span>
          <div className="flex-1 h-px bg-[var(--gold)]/20" />
        </h2>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-luxury ${
            isDragging
              ? "border-[var(--gold)] bg-[var(--gold)]/5"
              : "border-[var(--gold)]/30 hover:border-[var(--gold)]/50 hover:bg-[var(--background)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <svg className="w-12 h-12 mx-auto text-[var(--gold)]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>

          <p className="font-editorial text-[var(--foreground)]/70 mb-2">
            {isDragging ? "Drop images here" : "Drag & drop images here"}
          </p>
          <p className="text-xs text-[var(--foreground)]/50">
            or click to browse • JPEG, PNG, WebP, AVIF • Max 10MB each
          </p>
        </div>

        {/* Image Previews */}
        {mediaItems.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {mediaItems.map((item, index) => (
              <div key={index} className="relative group">
                <div className="aspect-[3/4] bg-[var(--background-deep)] border border-[var(--gold)]/10 overflow-hidden">
                  {item.isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Order badge */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-[var(--espresso)] text-[var(--gold)] text-xs flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Actions overlay */}
                {!item.isUploading && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveMedia(index, "up")}
                        className="w-8 h-8 bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--espresso)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {index < mediaItems.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveMedia(index, "down")}
                        className="w-8 h-8 bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--espresso)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="w-8 h-8 bg-[var(--wine)] text-[#F5F0E8] flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Featured badge for first image */}
                {index === 0 && !item.isUploading && (
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-[var(--gold)] text-[var(--espresso)] text-xs text-center tracking-wider uppercase">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-[var(--foreground)]/50 font-editorial">
          The first image will be the featured image shown in the storefront. Drag images to reorder.
        </p>
      </div>

      {/* Section: Status */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6 flex items-center gap-3">
          <span>Status</span>
          <div className="flex-1 h-px bg-[var(--gold)]/20" />
        </h2>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              id="archive"
              checked={formData.archive}
              onChange={(e) =>
                setFormData({ ...formData, archive: e.target.checked })
              }
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border border-[var(--gold)]/30 bg-[var(--background)] peer-checked:bg-[var(--wine)] peer-checked:border-[var(--wine)] transition-colors flex items-center justify-center">
              {formData.archive && (
                <svg className="w-3 h-3 text-[#F5F0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--foreground)] transition-colors">
            Archive this product
            <span className="text-[var(--foreground)]/50 ml-2">(hidden from storefront)</span>
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[var(--wine)]/10 border border-[var(--wine)]/30">
          <p className="text-sm text-[var(--wine)]">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center gap-4 pt-6 border-t border-[var(--gold)]/10">
        <button
          type="submit"
          disabled={loading || mediaItems.some((item) => item.isUploading)}
          className="px-8 py-4 bg-[var(--wine)] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[var(--espresso)] transition-luxury disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-8 py-4 border border-[var(--gold)]/30 text-[var(--foreground)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--background-deep)] transition-luxury disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
