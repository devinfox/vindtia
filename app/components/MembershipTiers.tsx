"use client";

import { useState } from "react";
import type { MembershipTier } from "@/lib/types/database";

type MembershipTiersProps = {
  tiers: MembershipTier[];
  currentTier: number;
  stripeCustomerId: string | null;
};

export default function MembershipTiers({
  tiers,
  currentTier,
  stripeCustomerId,
}: MembershipTiersProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleUpgrade = async (tier: number) => {
    setLoading(tier);

    try {
      // Ensure user has a Stripe customer ID
      if (!stripeCustomerId) {
        const customerRes = await fetch("/api/stripe/create-stripe-customer", {
          method: "POST",
        });

        if (!customerRes.ok) {
          const errorData = await customerRes.json();
          throw new Error(errorData.error || "Failed to create Stripe customer");
        }
      }

      // Create checkout session
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      alert(error.message || "Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  if (!tiers || tiers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          No membership tiers found. Please run the database seed script.
        </p>
        <code className="text-sm bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded">
          Run: supabase/seed.sql in Supabase SQL Editor
        </code>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => {
        const isCurrent = tier.id === currentTier;
        const isLower = tier.id < currentTier;
        const features = Array.isArray(tier.features) ? tier.features : [];

        return (
          <div
            key={tier.id}
            className={`relative flex flex-col p-6 rounded-lg border-2 ${
              isCurrent
                ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}
          >
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-xs font-medium rounded-full">
                Current Plan
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                {tier.name}
              </h3>
              {tier.id === 0 ? (
                <p className="text-3xl font-bold text-black dark:text-white">
                  Free
                </p>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Contact for pricing
                </p>
              )}
            </div>

            {features.length > 0 && (
              <ul className="flex-1 space-y-2 mb-6">
                {features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="text-red-600 dark:text-red-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {tier.id === 0 ? (
              <div className="text-center text-sm text-zinc-500 dark:text-zinc-500">
                Default tier
              </div>
            ) : isCurrent ? (
              <button
                disabled
                className="w-full px-4 py-3 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : isLower ? (
              <button
                disabled
                className="w-full px-4 py-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 font-medium cursor-not-allowed"
              >
                Downgrade unavailable
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={loading !== null}
                className="w-full px-4 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading === tier.id ? "Loading..." : "Upgrade"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
