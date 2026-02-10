"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Designer } from "@/lib/types/database";

type DesignerFormProps = {
  designer?: Designer;
};

export default function DesignerForm({ designer }: DesignerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: designer?.name || "",
    bio: designer?.bio || "",
    image_url: designer?.image_url || "",
  });

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

      router.push("/admin/designers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-6"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black dark:text-white mb-2"
        >
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          placeholder="Designer name"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-black dark:text-white mb-2"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          disabled={loading}
          rows={4}
          className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          placeholder="Brief bio or description"
        />
      </div>

      <div>
        <label
          htmlFor="image_url"
          className="block text-sm font-medium text-black dark:text-white mb-2"
        >
          Image URL
        </label>
        <input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          disabled={loading}
          className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          For now, provide a direct URL. File uploads coming soon.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : designer ? "Update Designer" : "Create Designer"}
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
