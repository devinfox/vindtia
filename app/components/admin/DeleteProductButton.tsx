"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${productName}"? This will also delete all associated media and inventory. This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
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
      className="flex-1 px-3 py-2 rounded-md bg-red-600 dark:bg-red-500 text-white text-xs hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
