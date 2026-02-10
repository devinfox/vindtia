"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Designer = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  designer_id: string | null;
  description: string | null;
  price_per_rental: number;
  size: string | null;
  color: string | null;
  category: string | null;
  condition: string | null;
  era: string | null;
  material: string | null;
  archive: boolean;
  tier_required: number;
  media?: { id: string; url: string; sort_order: number }[];
  inventory?: { id: string; quantity: number }[];
};

type ProductFormProps = {
  product?: Product;
  designers: Designer[];
};

export default function ProductForm({ product, designers }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    archive: product?.archive || false,
    tier_required: product?.tier_required || 1,
    quantity: product?.inventory?.[0]?.quantity || 1,
  });

  const [mediaUrls, setMediaUrls] = useState<string[]>(
    product?.media?.sort((a, b) => a.sort_order - b.sort_order).map((m) => m.url) || [""]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const method = product ? "PATCH" : "POST";

      // Clean up media URLs (remove empty strings)
      const cleanMediaUrls = mediaUrls.filter((url) => url.trim() !== "");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mediaUrls: cleanMediaUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const addMediaUrl = () => {
    setMediaUrls([...mediaUrls, ""]);
  };

  const updateMediaUrl = (index: number, value: string) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = value;
    setMediaUrls(newUrls);
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-6"
    >
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Designer
          </label>
          <select
            value={formData.designer_id}
            onChange={(e) =>
              setFormData({ ...formData, designer_id: e.target.value })
            }
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          >
            <option value="">No designer</option>
            {designers.map((designer) => (
              <option key={designer.id} value={designer.id}>
                {designer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
          rows={4}
          className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
        />
      </div>

      {/* Pricing & Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Price per Rental *
          </label>
          <input
            type="number"
            step="0.01"
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
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Tier Required *
          </label>
          <select
            value={formData.tier_required}
            onChange={(e) =>
              setFormData({ ...formData, tier_required: parseInt(e.target.value) })
            }
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          >
            <option value="0">Tier 0 (Free)</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Quantity *
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
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Size
          </label>
          <input
            type="text"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
            placeholder="e.g., S, M, L, XL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Color
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
            placeholder="e.g., Dress, Jacket, Pants"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Condition
          </label>
          <select
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          >
            <option value="">Select condition</option>
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Era
          </label>
          <select
            value={formData.era}
            onChange={(e) => setFormData({ ...formData, era: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          >
            <option value="">Select era</option>
            <option value="1920s">1920s</option>
            <option value="1930s">1930s</option>
            <option value="1940s">1940s</option>
            <option value="1950s">1950s</option>
            <option value="1960s">1960s</option>
            <option value="1970s">1970s</option>
            <option value="1980s">1980s</option>
            <option value="1990s">1990s</option>
            <option value="2000s">2000s</option>
            <option value="2010s">2010s</option>
            <option value="Contemporary">Contemporary</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Material
          </label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) =>
              setFormData({ ...formData, material: e.target.value })
            }
            disabled={loading}
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
            placeholder="e.g., Silk, Cashmere, Wool, Cotton"
          />
        </div>
      </div>

      {/* Archive Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="archive"
          checked={formData.archive}
          onChange={(e) =>
            setFormData({ ...formData, archive: e.target.checked })
          }
          disabled={loading}
          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        <label
          htmlFor="archive"
          className="text-sm text-black dark:text-white cursor-pointer"
        >
          Archive this product (hidden from storefront)
        </label>
      </div>

      {/* Media URLs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-black dark:text-white">
            Product Images
          </label>
          <button
            type="button"
            onClick={addMediaUrl}
            disabled={loading}
            className="text-sm text-red-600 dark:text-red-500 hover:underline disabled:opacity-50"
          >
            + Add Image
          </button>
        </div>
        <div className="space-y-3">
          {mediaUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => updateMediaUrl(index, e.target.value)}
                disabled={loading}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50 text-sm"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                #{index + 1}
              </span>
              {mediaUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMediaUrl(index)}
                  disabled={loading}
                  className="px-2 py-1 text-xs text-red-600 dark:text-red-500 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Images are ordered by the number shown. File uploads coming soon.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
