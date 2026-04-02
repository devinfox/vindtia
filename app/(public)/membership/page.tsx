import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { MembershipTier } from "@/lib/types/database";
import Navbar from "@/components/Navbar";

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
  const tierNames = ["Guest", "Connoisseur", "Collector", "Curator"];
  const tierDescriptions = [
    "Browse the archive",
    "Access to select archive pieces",
    "Priority access & exclusive pieces",
    "Full archive access & concierge service"
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <Navbar transparent={true} sticky={true} />

      {/* Hero Section */}
      <section
        className="relative pt-24 pb-16 lg:pt-28 lg:pb-20"
        style={{
          backgroundImage: "url('/vindtia-textured-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-[#C4B99A]/50" />
            <p className="text-[#C4B99A] text-xs tracking-[0.3em] uppercase">
              Membership
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-[#F5F0E8] mb-3 tracking-wide">
            Your Membership
          </h1>
          <p className="font-editorial text-[#F5F0E8]/60 italic">
            Manage your access to the archive
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16 bg-[var(--background-warm)] texture-paper">
        <div className="max-w-5xl mx-auto px-6">
          {/* Current Membership Card */}
          <div
            className="relative overflow-hidden mb-16 p-8 lg:p-12"
            style={{
              background: "linear-gradient(135deg, #62130e 0%, #4a0f0b 100%)",
            }}
          >
            {/* Decorative corner accents */}
            <div className="absolute top-4 left-4 w-16 h-16 pointer-events-none opacity-30">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C4B99A] to-transparent" />
              <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
            </div>
            <div className="absolute top-4 right-4 w-16 h-16 pointer-events-none opacity-30">
              <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#C4B99A] to-transparent" />
              <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 w-16 h-16 pointer-events-none opacity-30">
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C4B99A] to-transparent" />
              <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-[#C4B99A] to-transparent" />
            </div>
            <div className="absolute bottom-4 right-4 w-16 h-16 pointer-events-none opacity-30">
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#C4B99A] to-transparent" />
              <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-[#C4B99A] to-transparent" />
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
              <div>
                <p className="text-[#F5F0E8]/50 text-xs tracking-[0.3em] uppercase mb-3">
                  Current Plan
                </p>
                <h2 className="font-display text-3xl lg:text-4xl text-[#F5F0E8] tracking-wide mb-2">
                  {tierNames[profile?.membership_tier || 0]}
                </h2>
                <p className="font-editorial text-[#F5F0E8]/70 italic">
                  {tierDescriptions[profile?.membership_tier || 0]}
                </p>
              </div>
              {(profile?.membership_tier || 0) > 0 && (
                <div className="px-4 py-2 border border-[#C4B99A]/30 bg-[#C4B99A]/10">
                  <p className="font-button text-[10px] tracking-[0.2em] uppercase text-[#C4B99A]">
                    Active
                  </p>
                </div>
              )}
            </div>

            {currentTier?.features && Array.isArray(currentTier.features) && (
              <div className="mb-8 pt-8 border-t border-[#F5F0E8]/10">
                <p className="text-[#C4B99A] text-xs tracking-[0.2em] uppercase mb-4">
                  Your Benefits
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentTier.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 font-editorial text-sm text-[#F5F0E8]/80">
                      <span className="text-[#C4B99A] mt-0.5">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-8 border-t border-[#F5F0E8]/10">
              {(profile?.membership_tier || 0) < 3 && (
                <Link
                  href="/upgrade"
                  className="font-button px-8 py-4 bg-[#F5F0E8] text-[#62130e] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F0E8]/90 transition-all duration-500"
                >
                  Upgrade Membership
                </Link>
              )}
              {(profile?.membership_tier || 0) > 0 && profile?.stripe_customer_id && (
                <a
                  href={`/api/stripe/portal?customer_id=${profile.stripe_customer_id}`}
                  className="font-button px-8 py-4 border border-[#F5F0E8]/30 text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F0E8]/10 hover:border-[#F5F0E8]/50 transition-all duration-500"
                >
                  Manage Billing
                </a>
              )}
            </div>
          </div>

          {/* Available Tiers */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-10">
              <h3 className="font-display text-2xl text-[var(--foreground)] tracking-wide">
                Available Tiers
              </h3>
              <div className="flex-1 h-[1px] bg-[var(--gold)]/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers
                ?.filter((t: MembershipTier) => t.id > 0)
                .map((tier: MembershipTier) => {
                  const isCurrent = tier.id === (profile?.membership_tier || 0);
                  const isLower = tier.id < (profile?.membership_tier || 0);
                  const features = Array.isArray(tier.features) ? tier.features : [];

                  return (
                    <div
                      key={tier.id}
                      className={`relative p-6 lg:p-8 transition-all duration-500 ${
                        isCurrent
                          ? "bg-[#62130e]/5 border-2 border-[#62130e]/30"
                          : "bg-[var(--background)] border border-[var(--gold)]/10 hover:border-[var(--gold)]/30"
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-[#62130e] text-[#F5F0E8]">
                          <p className="font-button text-[9px] tracking-[0.2em] uppercase">
                            Current
                          </p>
                        </div>
                      )}

                      <p className="text-[var(--gold)] text-[10px] tracking-[0.3em] uppercase mb-2">
                        Tier {tier.id}
                      </p>
                      <h4 className="font-display text-xl lg:text-2xl text-[var(--foreground)] tracking-wide mb-4">
                        {tier.name}
                      </h4>

                      {features.length > 0 && (
                        <ul className="space-y-3 mb-6">
                          {features.slice(0, 4).map((feature: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-[var(--foreground)]/70 font-editorial"
                            >
                              <span className="text-[#62130e] mt-0.5">✦</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                          {features.length > 4 && (
                            <li className="text-xs text-[var(--foreground)]/40 italic pl-5">
                              +{features.length - 4} more benefits
                            </li>
                          )}
                        </ul>
                      )}

                      {!isCurrent && !isLower && (
                        <Link
                          href="/upgrade"
                          className="font-button block w-full px-4 py-3 text-center border border-[#62130e] text-[#62130e] text-xs tracking-[0.15em] uppercase hover:bg-[#62130e] hover:text-[#F5F0E8] transition-all duration-500"
                        >
                          Upgrade
                        </Link>
                      )}

                      {isLower && (
                        <p className="font-editorial text-xs text-[var(--foreground)]/40 italic text-center py-3">
                          Included in your plan
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-6">
              <h4 className="font-display text-xl text-[var(--foreground)] tracking-wide">
                Need Assistance?
              </h4>
              <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
            </div>
            <p className="font-editorial text-[var(--foreground)]/60 mb-6 max-w-2xl">
              Questions about your membership? Our concierge team is here to help with
              plan changes, billing inquiries, or any other questions you may have.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/upgrade"
                className="font-button text-xs tracking-[0.15em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors flex items-center gap-2"
              >
                View All Plans
                <span>→</span>
              </Link>
              {profile?.stripe_customer_id && (
                <a
                  href={`/api/stripe/portal?customer_id=${profile.stripe_customer_id}`}
                  className="font-button text-xs tracking-[0.15em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors flex items-center gap-2"
                >
                  Manage Subscription
                  <span>→</span>
                </a>
              )}
              <Link
                href="/dashboard"
                className="font-button text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors flex items-center gap-2"
              >
                Back to Dashboard
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-16 text-[#F5F0E8]/60 overflow-hidden"
        style={{
          backgroundImage: "url('/vindtia-textured-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <span className="font-display text-2xl lg:text-3xl tracking-[0.25em] text-white">
              VINDTIA
            </span>
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--gold)]/40" />
              <div className="w-1 h-1 rounded-full bg-[var(--gold)]/50" />
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--gold)]/40" />
            </div>
            <p className="font-editorial text-sm tracking-wider italic">
              Archive Couture, Reimagined
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
