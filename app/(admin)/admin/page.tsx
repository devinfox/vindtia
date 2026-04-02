import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats
  const [
    { count: productsCount },
    { count: designersCount },
    { count: ordersCount },
    { count: usersCount },
    { count: activeRentalsCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("designers").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .in("status", ["confirmed", "shipped", "delivered", "active"]),
  ]);

  // Recent products
  const { data: recentProducts } = await supabase
    .from("products")
    .select("id, name, created_at, designer:designers(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, amount, status, created_at, user:profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent rentals
  const { data: recentRentals } = await supabase
    .from("rentals")
    .select("id, status, start_date, end_date, user:profiles(name, email), product:products(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)]">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
          <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
            Overview
          </p>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
          Admin Dashboard
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {[
          { label: "Total Products", value: productsCount || 0, href: "/admin/products" },
          { label: "Designers", value: designersCount || 0, href: "/admin/designers" },
          { label: "Active Rentals", value: activeRentalsCount || 0, href: "/admin/rentals" },
          { label: "Total Orders", value: ordersCount || 0, href: "/admin/orders" },
          { label: "Total Users", value: usersCount || 0, href: "#" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-[var(--background)] border border-[var(--gold)]/10 p-6 hover:border-[var(--gold)]/30 transition-all duration-500"
          >
            <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-3">
              {stat.label}
            </p>
            <p className="font-display text-4xl text-[var(--foreground)] group-hover:text-[#62130e] transition-colors">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-12 bg-[var(--background)] border border-[var(--gold)]/10 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-xl text-[var(--foreground)] tracking-wide">
            Quick Actions
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/products/new"
            className="font-button px-6 py-3 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-all duration-500"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/designers/new"
            className="font-button px-6 py-3 border border-[#62130e] text-[#62130e] text-xs tracking-[0.2em] uppercase hover:bg-[#62130e] hover:text-[#F5F0E8] transition-all duration-500"
          >
            + Add Designer
          </Link>
          <Link
            href="/admin/rentals"
            className="font-button px-6 py-3 border border-[var(--gold)]/30 text-[var(--foreground)] text-xs tracking-[0.2em] uppercase hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all duration-500"
          >
            Manage Rentals
          </Link>
          <Link
            href="/admin/analytics"
            className="font-button px-6 py-3 border border-[var(--gold)]/30 text-[var(--foreground)] text-xs tracking-[0.2em] uppercase hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all duration-500"
          >
            View Analytics
          </Link>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Recent Products
            </h2>
            <Link
              href="/admin/products"
              className="font-button text-[10px] tracking-[0.15em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentProducts && recentProducts.length > 0 ? (
            <div className="space-y-4">
              {recentProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--gold)]/10 last:border-0"
                >
                  <div>
                    <p className="font-editorial text-[var(--foreground)] text-sm">
                      {product.name}
                    </p>
                    <p className="text-[10px] text-[var(--foreground)]/50 italic">
                      {product.designer?.name || "No designer"}
                    </p>
                  </div>
                  <p className="text-[10px] text-[var(--foreground)]/40">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-editorial text-[var(--foreground)]/50 italic text-sm">
              No products yet
            </p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="font-button text-[10px] tracking-[0.15em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--gold)]/10 last:border-0"
                >
                  <div>
                    <p className="font-editorial text-[var(--foreground)] text-sm">
                      ${order.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-[var(--foreground)]/50 italic truncate max-w-[150px]">
                      {order.user?.email || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-button text-[9px] tracking-[0.1em] uppercase px-2 py-1 ${
                        order.status === "completed"
                          ? "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20"
                          : "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-editorial text-[var(--foreground)]/50 italic text-sm">
              No orders yet
            </p>
          )}
        </div>

        {/* Recent Rentals */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Recent Rentals
            </h2>
            <Link
              href="/admin/rentals"
              className="font-button text-[10px] tracking-[0.15em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentRentals && recentRentals.length > 0 ? (
            <div className="space-y-4">
              {recentRentals.map((rental: any) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--gold)]/10 last:border-0"
                >
                  <div>
                    <p className="font-editorial text-[var(--foreground)] text-sm truncate max-w-[150px]">
                      {rental.product?.name || "Unknown"}
                    </p>
                    <p className="text-[10px] text-[var(--foreground)]/50 italic">
                      {rental.user?.email?.split("@")[0] || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-button text-[9px] tracking-[0.1em] uppercase px-2 py-1 ${
                        rental.status === "active"
                          ? "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20"
                          : rental.status === "pending"
                          ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20"
                          : "bg-[var(--foreground)]/5 text-[var(--foreground)]/50 border border-[var(--foreground)]/10"
                      }`}
                    >
                      {rental.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-editorial text-[var(--foreground)]/50 italic text-sm">
              No rentals yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
