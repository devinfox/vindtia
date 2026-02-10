"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Rental = {
  id: string;
  status: string;
  tracking_number: string | null;
  return_tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
};

type RentalStatusManagerProps = {
  rental: Rental;
};

const statusFlow: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["active"],
  active: ["return_initiated"],
  return_initiated: ["return_shipped"],
  return_shipped: ["returned"],
  returned: ["completed"],
  completed: [],
  cancelled: [],
};

export default function RentalStatusManager({
  rental,
}: RentalStatusManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [trackingNumber, setTrackingNumber] = useState(
    rental.tracking_number || ""
  );
  const [returnTrackingNumber, setReturnTrackingNumber] = useState(
    rental.return_tracking_number || ""
  );
  const [shippingCarrier, setShippingCarrier] = useState(
    rental.shipping_carrier || ""
  );
  const [notes, setNotes] = useState(rental.notes || "");

  const nextStatuses = statusFlow[rental.status] || [];

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    setError("");

    try {
      const updates: Record<string, any> = { status: newStatus };

      // Add timestamps based on status
      const now = new Date().toISOString();
      if (newStatus === "shipped") {
        updates.shipped_at = now;
        updates.tracking_number = trackingNumber;
        updates.shipping_carrier = shippingCarrier;
      } else if (newStatus === "delivered") {
        updates.delivered_at = now;
      } else if (newStatus === "return_initiated") {
        updates.return_initiated_at = now;
      } else if (newStatus === "return_shipped") {
        updates.return_shipped_at = now;
        updates.return_tracking_number = returnTrackingNumber;
      } else if (newStatus === "returned") {
        updates.returned_at = now;
      }

      updates.notes = notes;

      const res = await fetch(`/api/admin/rentals/${rental.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update rental");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (nextStatuses.length === 0) {
    return (
      <span className="text-xs text-zinc-500 dark:text-zinc-500">
        No actions
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-red-600 dark:text-red-500 hover:underline"
      >
        Update
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 top-8 z-50 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-4">
            <h4 className="font-semibold text-black dark:text-white mb-4">
              Update Rental Status
            </h4>

            {/* Shipping fields */}
            {(rental.status === "confirmed" ||
              rental.status === "return_initiated") && (
              <div className="space-y-3 mb-4">
                {rental.status === "confirmed" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Shipping Carrier
                      </label>
                      <select
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      >
                        <option value="">Select carrier</option>
                        <option value="UPS">UPS</option>
                        <option value="FedEx">FedEx</option>
                        <option value="USPS">USPS</option>
                        <option value="DHL">DHL</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}
                {rental.status === "return_initiated" && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Return Tracking Number
                    </label>
                    <input
                      type="text"
                      value={returnTrackingNumber}
                      onChange={(e) => setReturnTrackingNumber(e.target.value)}
                      placeholder="Enter return tracking"
                      className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                {error}
              </p>
            )}

            {/* Status buttons */}
            <div className="space-y-2">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={loading}
                  className={`w-full px-3 py-2 text-sm rounded-md font-medium transition-colors disabled:opacity-50 ${
                    status === "cancelled"
                      ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40"
                      : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  }`}
                >
                  {loading ? "Updating..." : `Mark as ${status.replace(/_/g, " ")}`}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
