import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembershipTiers from "@/components/MembershipTiers";

export default async function UpgradePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/upgrade");
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

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-red-600 dark:text-red-500 mb-4">
            VINDTIA
          </h1>
          <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white mb-2">
            Choose Your Membership
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Unlock exclusive access to archive-level vintage fashion
          </p>
        </div>

        <MembershipTiers
          tiers={tiers || []}
          currentTier={profile?.membership_tier || 0}
          stripeCustomerId={profile?.stripe_customer_id}
        />
      </div>
    </div>
  );
}
