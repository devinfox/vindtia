"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Designer } from "@/lib/types/database";

type DesignerFormProps = {
  designer?: Designer;
};

// Generate URL-friendly slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DesignerForm({ designer }: DesignerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: designer?.name || "",
    slug: designer?.slug || "",
    bio: designer?.bio || "",
    image_url: designer?.image_url || "",
    founded: designer?.founded || "",
    origin: designer?.origin || "",
    headquarters: designer?.headquarters || "",
    signature: designer?.signature || "",
    featured: designer?.featured || false,
  });

  // Auto-generate slug from name when creating new designer
  useEffect(() => {
    if (!designer && formData.name && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, designer, formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = designer
        ? `/api/admin/designers/${designer.id}`
        : "/api/admin/designers";

      const method = designer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save designer");
      }

      // Broadcast new designer to other tabs (for spreadsheet real-time updates)
      if (!designer && data.id) {
        try {
          const channel = new BroadcastChannel("vindtia-designers");
          channel.postMessage({
            type: "designer-created",
            designer: { id: data.id, name: data.name },
          });
          channel.close();
        } catch (err) {
          // BroadcastChannel not supported, ignore
        }
      }

      router.push("/admin/designers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full px-4 py-3 bg-[var(--background)] border border-[var(--gold)]/20 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[#62130e]/50 disabled:opacity-50 transition-colors placeholder:text-[var(--foreground)]/30 placeholder:italic";
  const labelStyles =
    "block text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] mb-2 font-button";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info Section */}
      <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
            Basic Information
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelStyles}>
              Designer Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug:
                    formData.slug === generateSlug(formData.name) ||
                    !formData.slug
                      ? generateSlug(name)
                      : formData.slug,
                });
              }}
              required
              disabled={loading}
              className={inputStyles}
              placeholder="e.g., Versace"
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelStyles}>
              URL Slug *
            </label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                })
              }
              required
              disabled={loading}
              className={inputStyles}
              placeholder="e.g., versace"
            />
            <p className="mt-2 text-xs text-[var(--foreground)]/40 font-editorial italic">
              URL path: /brand/{formData.slug || "designer-name"}
            </p>
          </div>
        </div>
      </div>

      {/* Brand Details Section */}
      <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
            Brand Details
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="founded" className={labelStyles}>
              Founded
            </label>
            <input
              id="founded"
              type="text"
              value={formData.founded}
              onChange={(e) =>
                setFormData({ ...formData, founded: e.target.value })
              }
              disabled={loading}
              className={inputStyles}
              placeholder="e.g., 1978"
            />
          </div>

          <div>
            <label htmlFor="origin" className={labelStyles}>
              Origin
            </label>
            <input
              id="origin"
              type="text"
              value={formData.origin}
              onChange={(e) =>
                setFormData({ ...formData, origin: e.target.value })
              }
              disabled={loading}
              className={inputStyles}
              placeholder="e.g., Milan, Italy"
            />
          </div>

          <div>
            <label htmlFor="headquarters" className={labelStyles}>
              Headquarters
            </label>
            <input
              id="headquarters"
              type="text"
              value={formData.headquarters}
              onChange={(e) =>
                setFormData({ ...formData, headquarters: e.target.value })
              }
              disabled={loading}
              className={inputStyles}
              placeholder="e.g., Milan, Italy"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signature" className={labelStyles}>
            Signature Style
          </label>
          <input
            id="signature"
            type="text"
            value={formData.signature}
            onChange={(e) =>
              setFormData({ ...formData, signature: e.target.value })
            }
            disabled={loading}
            className={inputStyles}
            placeholder="e.g., Baroque prints, Medusa motif, bold use of gold"
          />
          <p className="mt-2 text-xs text-[var(--foreground)]/40 font-editorial italic">
            A brief description of the designer&apos;s signature elements
          </p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
            Biography
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
        </div>

        <div>
          <label htmlFor="bio" className={labelStyles}>
            Bio / History
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={loading}
            rows={5}
            className={inputStyles}
            placeholder="Brief bio or history of the designer..."
          />
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
            Media
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
        </div>

        <div>
          <label htmlFor="image_url" className={labelStyles}>
            Card Image URL
          </label>
          <input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            disabled={loading}
            className={inputStyles}
            placeholder="https://example.com/designer-card.jpg"
          />
          <p className="mt-2 text-xs text-[var(--foreground)]/40 font-editorial italic">
            Image displayed on the homepage designer cards
          </p>
        </div>

        {formData.image_url && (
          <div className="mt-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] mb-2 font-button">
              Preview
            </p>
            <div className="w-32 h-40 bg-[var(--background-warm)] border border-[var(--gold)]/20 overflow-hidden">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
            Settings
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
        </div>

        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--gold)]/20 peer-focus:outline-none border border-[var(--gold)]/30 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--foreground)]/40 after:border-[var(--foreground)]/10 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-[#62130e] peer-checked:after:bg-[#F5F0E8]"></div>
          </label>
          <span className="text-sm text-[var(--foreground)] font-editorial">
            Featured on homepage
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[#62130e]/10 border border-[#62130e]/30">
          <p className="text-sm text-[#62130e] font-editorial">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="font-button px-8 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500"
        >
          {loading
            ? "Saving..."
            : designer
            ? "Update Designer"
            : "Create Designer"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="font-button px-8 py-4 border border-[var(--gold)]/30 text-[var(--foreground)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--gold)]/5 hover:border-[var(--gold)] disabled:opacity-50 transition-all duration-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
