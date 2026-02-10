import { createClient } from "@/lib/supabase/server";

type OrderData = {
  amount: number;
  created_at: string;
  status: string;
};

type ProfileData = {
  membership_tier: number;
};

type RentalData = {
  status: string;
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Revenue data - last 12 months
  const { data: revenueData } = await supabase
    .from("orders")
    .select("amount, created_at, status")
    .eq("status", "completed")
    .gte(
      "created_at",
      new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString()
    )
    .order("created_at", { ascending: true });

  // Process revenue by month
  const revenueByMonth: Record<string, number> = {};
  (revenueData as OrderData[] | null)?.forEach((order) => {
    const month = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(order.amount);
  });

  const monthlyRevenue = Object.entries(revenueByMonth).map(([month, total]) => ({
    month,
    total,
  }));

  // Total revenue
  const totalRevenue = (revenueData as OrderData[] | null)?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

  // Membership tier distribution
  const { data: membershipData } = await supabase
    .from("profiles")
    .select("membership_tier");

  const tierCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  (membershipData as ProfileData[] | null)?.forEach((p) => {
    tierCounts[p.membership_tier] = (tierCounts[p.membership_tier] || 0) + 1;
  });

  const totalMembers = membershipData?.length || 0;
  const paidMembers = totalMembers - (tierCounts[0] || 0);

  // Top performing products
  const { data: topProducts } = await supabase
    .from("rentals")
    .select(
      `
      product_id,
      product:products(name, price_per_rental, designer:designers(name))
    `
    )
    .not("status", "eq", "cancelled");

  const productRentals: Record<string, { name: string; designer: string; count: number; revenue: number }> = {};
  topProducts?.forEach((r: any) => {
    if (r.product) {
      const id = r.product_id;
      if (!productRentals[id]) {
        productRentals[id] = {
          name: r.product.name,
          designer: r.product.designer?.name || "Unknown",
          count: 0,
          revenue: 0,
        };
      }
      productRentals[id].count++;
      productRentals[id].revenue += Number(r.product.price_per_rental);
    }
  });

  const topProductsList = Object.values(productRentals)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Rental status distribution
  const { data: rentalStatusData } = await supabase
    .from("rentals")
    .select("status");

  const rentalStatusCounts: Record<string, number> = {};
  (rentalStatusData as RentalData[] | null)?.forEach((r) => {
    rentalStatusCounts[r.status] = (rentalStatusCounts[r.status] || 0) + 1;
  });

  // Recent activity
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentRentals } = await supabase
    .from("rentals")
    .select("id, status, created_at, product:products(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const tierNames = ["Free", "Tier 1", "Tier 2", "Tier 3"];
  const tierColors = [
    "bg-zinc-200 dark:bg-zinc-700",
    "bg-blue-500",
    "bg-purple-500",
    "bg-red-500",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Analytics Dashboard
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Total Members
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {totalMembers}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Paid Members
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {paidMembers}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Conversion Rate
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {totalMembers > 0 ? ((paidMembers / totalMembers) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Monthly Revenue
          </h2>
          {monthlyRevenue.length > 0 ? (
            <div className="space-y-3">
              {monthlyRevenue.slice(-6).map((item) => {
                const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.total));
                const percentage = maxRevenue > 0 ? (item.total / maxRevenue) * 100 : 0;

                return (
                  <div key={item.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {item.month}
                      </span>
                      <span className="font-medium text-black dark:text-white">
                        ${item.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              No revenue data yet
            </p>
          )}
        </div>

        {/* Membership Distribution */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Membership Distribution
          </h2>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((tier) => {
              const count = tierCounts[tier] || 0;
              const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0;

              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {tierNames[tier]}
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${tierColors[tier]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rental Status Overview */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Rental Status Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(rentalStatusCounts).map(([status, count]) => (
              <div
                key={status}
                className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
              >
                <p className="text-xs text-zinc-600 dark:text-zinc-400 uppercase">
                  {status.replace(/_/g, " ")}
                </p>
                <p className="text-xl font-bold text-black dark:text-white">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Top Performing Products
          </h2>
          {topProductsList.length > 0 ? (
            <div className="space-y-3">
              {topProductsList.slice(0, 5).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {product.designer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black dark:text-white">
                      {product.count} rentals
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              No rental data yet
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Recent Orders
          </h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      ${order.amount}
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
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              No orders yet
            </p>
          )}
        </div>

        {/* Recent Rentals */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Recent Rentals
          </h2>
          {recentRentals && recentRentals.length > 0 ? (
            <div className="space-y-3">
              {recentRentals.map((rental: any) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {rental.product?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(rental.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {rental.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              No rentals yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
