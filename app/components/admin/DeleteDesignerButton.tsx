"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteDesignerButtonProps = {
  designerId: string;
  designerName: string;
};

export default function DeleteDesignerButton({
  designerId,
  designerName,
}: DeleteDesignerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${designerName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/designers/${designerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete designer");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-block px-3 py-1 rounded-md bg-red-600 dark:bg-red-500 text-white text-xs hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
