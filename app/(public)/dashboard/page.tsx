import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";

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
            <nav className="flex items-center gap-6">
              <Link
                href="/storefront"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Browse Archive
              </Link>
              <Link
                href="/membership"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Membership
              </Link>
              <UserMenu email={user.email} name={profile?.name} />
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-2">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Current membership: {tierNames[profile?.membership_tier || 0]}
          </p>
        </div>

        {/* Membership Card */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Your Membership</p>
              <p className="text-2xl font-bold">
                {tierNames[profile?.membership_tier || 0]}
              </p>
            </div>
            <Link
              href={profile?.membership_tier === 0 ? "/upgrade" : "/membership"}
              className="px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm font-medium transition-colors"
            >
              {profile?.membership_tier === 0 ? "Upgrade" : "Manage"}
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              Active Rentals
            </p>
            <p className="text-3xl font-bold text-black dark:text-white">
              {rentals?.filter((r: any) => r.status === "active").length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              Total Rentals
            </p>
            <p className="text-3xl font-bold text-black dark:text-white">
              {rentals?.length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              Total Orders
            </p>
            <p className="text-3xl font-bold text-black dark:text-white">
              {orders?.length || 0}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Rentals */}
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Recent Rentals
            </h3>
            {rentals && rentals.length > 0 ? (
              <div className="space-y-3">
                {rentals.map((rental: any) => (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {rental.product?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {rental.product?.designer?.name || "No designer"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        rental.status === "active"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {rental.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No rentals yet.{" "}
                <Link
                  href="/storefront"
                  className="text-red-600 dark:text-red-500 hover:underline"
                >
                  Browse the archive
                </Link>
              </p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Recent Orders
            </h3>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        ${order.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No orders yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
