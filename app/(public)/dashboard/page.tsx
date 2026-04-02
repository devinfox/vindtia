import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's rentals
  const { data: rentals } = await supabase
    .from("rentals")
    .select(
      `
      *,
      product:products(id, name, designer:designers(name))
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const tierNames = ["Guest", "Connoisseur", "Collector", "Curator"];
  const tierDescriptions = [
    "Browse the archive",
    "Access to select pieces",
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
              Member Dashboard
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-[#F5F0E8] mb-3 tracking-wide">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}
          </h1>
          <p className="font-editorial text-[#F5F0E8]/60 italic">
            Your personal archive awaits
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16 bg-[var(--background-warm)] texture-paper">
        <div className="max-w-7xl mx-auto px-6">
          {/* Membership Card */}
          <div
            className="relative overflow-hidden mb-12 p-8 lg:p-10"
            style={{
              background: "linear-gradient(135deg, #62130e 0%, #4a0f0b 100%)",
            }}
          >
            {/* Decorative corner accents */}
            <div className="absolute top-4 left-4 w-12 h-12 pointer-events-none opacity-30">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C4B99A] to-transparent" />
              <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
            </div>
            <div className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none opacity-30">
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#C4B99A] to-transparent" />
              <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-[#C4B99A] to-transparent" />
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <p className="text-[#F5F0E8]/60 text-xs tracking-[0.3em] uppercase mb-2">
                  Your Membership
                </p>
                <h2 className="font-display text-2xl lg:text-3xl text-[#F5F0E8] tracking-wide mb-2">
                  {tierNames[profile?.membership_tier || 0]}
                </h2>
                <p className="font-editorial text-[#F5F0E8]/70 italic text-sm">
                  {tierDescriptions[profile?.membership_tier || 0]}
                </p>
              </div>
              <Link
                href={profile?.membership_tier === 0 ? "/upgrade" : "/membership"}
                className="font-button px-8 py-3 border border-[#F5F0E8]/30 text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F0E8]/10 hover:border-[#F5F0E8]/50 transition-all duration-500"
              >
                {profile?.membership_tier === 0 ? "Upgrade Membership" : "Manage Membership"}
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
              <p className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase mb-3">
                Active Rentals
              </p>
              <p className="font-display text-4xl lg:text-5xl text-[var(--foreground)]">
                {rentals?.filter((r: any) => r.status === "active").length || 0}
              </p>
            </div>
            <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
              <p className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase mb-3">
                Total Rentals
              </p>
              <p className="font-display text-4xl lg:text-5xl text-[var(--foreground)]">
                {rentals?.length || 0}
              </p>
            </div>
            <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
              <p className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase mb-3">
                Total Orders
              </p>
              <p className="font-display text-4xl lg:text-5xl text-[var(--foreground)]">
                {orders?.length || 0}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Rentals */}
            <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-display text-xl text-[var(--foreground)] tracking-wide">
                  Recent Rentals
                </h3>
                <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
              </div>
              {rentals && rentals.length > 0 ? (
                <div className="space-y-4">
                  {rentals.map((rental: any) => (
                    <div
                      key={rental.id}
                      className="flex items-center justify-between py-4 border-b border-[var(--gold)]/10 last:border-0"
                    >
                      <div>
                        <p className="font-editorial text-[var(--foreground)] mb-1">
                          {rental.product?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-[var(--foreground)]/50 italic">
                          {rental.product?.designer?.name || "No designer"}
                        </p>
                      </div>
                      <span
                        className={`font-button text-[10px] tracking-[0.15em] uppercase px-3 py-1 ${
                          rental.status === "active"
                            ? "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20"
                            : "bg-[var(--foreground)]/5 text-[var(--foreground)]/50 border border-[var(--foreground)]/10"
                        }`}
                      >
                        {rental.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-editorial text-[var(--foreground)]/50 italic mb-4">
                    No rentals yet
                  </p>
                  <Link
                    href="/storefront"
                    className="font-button text-xs tracking-[0.15em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors"
                  >
                    Browse the Archive →
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-display text-xl text-[var(--foreground)] tracking-wide">
                  Recent Orders
                </h3>
                <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
              </div>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-4 border-b border-[var(--gold)]/10 last:border-0"
                    >
                      <div>
                        <p className="font-editorial text-[var(--foreground)] mb-1">
                          ${order.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--foreground)]/50 italic">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <span
                        className={`font-button text-[10px] tracking-[0.15em] uppercase px-3 py-1 ${
                          order.status === "completed"
                            ? "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20"
                            : "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-editorial text-[var(--foreground)]/50 italic">
                    No orders yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 pt-12 border-t border-[var(--gold)]/10">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="font-display text-xl text-[var(--foreground)] tracking-wide">
                Quick Actions
              </h3>
              <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/storefront"
                className="font-button px-8 py-4 border border-[#62130e] text-[#62130e] text-xs tracking-[0.2em] uppercase hover:bg-[#62130e] hover:text-[#F5F0E8] transition-all duration-500"
              >
                Browse Archive
              </Link>
              <Link
                href="/designers"
                className="font-button px-8 py-4 border border-[var(--gold)]/30 text-[var(--foreground)] text-xs tracking-[0.2em] uppercase hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all duration-500"
              >
                View Designers
              </Link>
              <Link
                href="/membership"
                className="font-button px-8 py-4 border border-[var(--gold)]/30 text-[var(--foreground)] text-xs tracking-[0.2em] uppercase hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all duration-500"
              >
                Membership Details
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
