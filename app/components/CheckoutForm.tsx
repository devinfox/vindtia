"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CheckoutFormProps = {
  rentalId: string;
  amount: number;
  stripeCustomerId: string | null;
};

export default function CheckoutForm({
  rentalId,
  amount,
  stripeCustomerId,
}: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      // First ensure user has a Stripe customer ID
      let customerId = stripeCustomerId;
      if (!customerId) {
        const customerRes = await fetch("/api/stripe/create-stripe-customer", {
          method: "POST",
        });
        const customerData = await customerRes.json();
        if (!customerRes.ok) {
          throw new Error(customerData.error || "Failed to create customer");
        }
        customerId = customerData.customerId;
      }

      // Create payment checkout session
      const res = await fetch("/api/stripe/create-rental-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rental_id: rentalId,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await fetch(`/api/rentals/${rentalId}`, {
        method: "DELETE",
      });
      router.push("/storefront");
    } catch {
      router.push("/storefront");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Payment
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        You'll be redirected to our secure payment partner, Stripe, to complete
        your rental payment.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full px-6 py-4 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="w-full px-6 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Cancel Rental
        </button>
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500 text-center">
        By proceeding, you agree to our rental terms and conditions.
      </p>
    </div>
  );
}
