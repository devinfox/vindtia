import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { MembershipTier } from "@/lib/types/database";

export default async function MembershipPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/membership");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("*")
    .order("id", { ascending: true });

  const currentTier = tiers?.find((t: MembershipTier) => t.id === (profile?.membership_tier || 0));
  const tierNames = ["Free", "Tier 1", "Tier 2", "Tier 3"];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">
                VINDTIA
              </h1>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Current Membership */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-6">
            Your Membership
          </h2>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 mb-2">Current Plan</p>
                <p className="text-4xl font-bold">
                  {tierNames[profile?.membership_tier || 0]}
                </p>
              </div>
              {(profile?.membership_tier || 0) > 0 && (
                <div className="px-4 py-2 rounded-md bg-white/20 backdrop-blur-sm">
                  <p className="text-sm font-medium">Active</p>
                </div>
              )}
            </div>

            {currentTier?.features && Array.isArray(currentTier.features) && (
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium opacity-90 uppercase tracking-wider">
                  Your Benefits
                </p>
                <ul className="space-y-2">
                  {currentTier.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="opacity-90">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-white/20">
              {(profile?.membership_tier || 0) < 3 && (
                <Link
                  href="/upgrade"
                  className="px-6 py-3 rounded-md bg-white text-red-600 font-medium hover:bg-zinc-100 transition-colors"
                >
                  Upgrade Membership
                </Link>
              )}
              {(profile?.membership_tier || 0) > 0 && profile?.stripe_customer_id && (
                <a
                  href={`/api/stripe/portal?customer_id=${profile.stripe_customer_id}`}
                  className="px-6 py-3 rounded-md bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Manage Billing
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Available Tiers */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-6">
            Available Membership Tiers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers
              ?.filter((t: MembershipTier) => t.id > 0)
              .map((tier: MembershipTier) => {
                const isCurrent = tier.id === (profile?.membership_tier || 0);
                const isLower = tier.id < (profile?.membership_tier || 0);
                const features = Array.isArray(tier.features) ? tier.features : [];

                return (
                  <div
                    key={tier.id}
                    className={`relative p-6 rounded-lg border-2 ${
                      isCurrent
                        ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-4 px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-xs font-medium rounded-full">
                        Current Plan
                      </div>
                    )}

                    <h4 className="text-2xl font-bold text-black dark:text-white mb-4">
                      {tier.name}
                    </h4>

                    {features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {features.map((feature: string, idx: number) => (
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

                    {!isCurrent && !isLower && (
                      <Link
                        href="/upgrade"
                        className="block w-full px-4 py-3 text-center rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        Upgrade to {tier.name}
                      </Link>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
          <h4 className="text-lg font-semibold text-black dark:text-white mb-3">
            Need Help?
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Questions about your membership? Want to cancel or change plans?
          </p>
          <div className="flex gap-3">
            <Link
              href="/upgrade"
              className="text-sm text-red-600 dark:text-red-500 hover:underline"
            >
              View All Plans
            </Link>
            {profile?.stripe_customer_id && (
              <a
                href={`/api/stripe/portal?customer_id=${profile.stripe_customer_id}`}
                className="text-sm text-red-600 dark:text-red-500 hover:underline"
              >
                Manage Subscription
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
