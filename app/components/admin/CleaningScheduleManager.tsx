"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Schedule = {
  id: string;
  product_id: string;
  scheduled_date: string;
  status: string;
  cleaning_type: string;
  notes: string | null;
};

type Product = {
  id: string;
  name: string;
};

type CleaningScheduleManagerProps = {
  schedule?: Schedule;
  products: Product[];
  mode: "create" | "update";
};

export default function CleaningScheduleManager({
  schedule,
  products,
  mode,
}: CleaningScheduleManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState(schedule?.product_id || "");
  const [scheduledDate, setScheduledDate] = useState(
    schedule?.scheduled_date || new Date().toISOString().split("T")[0]
  );
  const [cleaningType, setCleaningType] = useState(
    schedule?.cleaning_type || "standard"
  );
  const [status, setStatus] = useState(schedule?.status || "pending");
  const [notes, setNotes] = useState(schedule?.notes || "");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const url =
        mode === "create"
          ? "/api/admin/cleaning"
          : `/api/admin/cleaning/${schedule?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const body: Record<string, any> = {
        scheduled_date: scheduledDate,
        cleaning_type: cleaningType,
        notes: notes || null,
      };

      if (mode === "create") {
        body.product_id = productId;
      } else {
        body.status = status;
        if (status === "completed") {
          body.completed_at = new Date().toISOString();
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save schedule");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cleaning schedule?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cleaning/${schedule?.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete schedule");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-sm ${
          mode === "create"
            ? "px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            : "text-red-600 dark:text-red-500 hover:underline"
        }`}
      >
        {mode === "create" ? "+ Schedule Cleaning" : "Update"}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                {mode === "create" ? "Schedule Cleaning" : "Update Cleaning Schedule"}
              </h3>

              <div className="space-y-4">
                {/* Product Selection (create only) */}
                {mode === "create" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Product *
                    </label>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Scheduled Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  />
                </div>

                {/* Cleaning Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Cleaning Type
                  </label>
                  <select
                    value={cleaningType}
                    onChange={(e) => setCleaningType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  >
                    <option value="standard">Standard Clean</option>
                    <option value="deep">Deep Clean</option>
                    <option value="spot">Spot Clean</option>
                    <option value="preservation">Preservation</option>
                  </select>
                </div>

                {/* Status (update only) */}
                {mode === "update" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || (mode === "create" && !productId)}
                  className="flex-1 px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : mode === "create" ? "Create Schedule" : "Update Schedule"}
                </button>
                {mode === "update" && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-3 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
