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

  const { data: revenueData } = await supabase
    .from("orders")
    .select("amount, created_at, status")
    .eq("status", "completed")
    .gte(
      "created_at",
      new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString()
    )
    .order("created_at", { ascending: true });

  const revenueByMonth: Record<string, number> = {};
  (revenueData as OrderData[] | null)?.forEach((order) => {
    const month = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(order.amount);
  });

  const monthlyRevenue = Object.entries(revenueByMonth).map(
    ([month, total]) => ({
      month,
      total,
    })
  );

  const totalRevenue =
    (revenueData as OrderData[] | null)?.reduce(
      (sum, o) => sum + Number(o.amount),
      0
    ) || 0;

  const { data: membershipData } = await supabase
    .from("profiles")
    .select("membership_tier");

  const tierCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  (membershipData as ProfileData[] | null)?.forEach((p) => {
    tierCounts[p.membership_tier] = (tierCounts[p.membership_tier] || 0) + 1;
  });

  const totalMembers = membershipData?.length || 0;
  const paidMembers = totalMembers - (tierCounts[0] || 0);

  const { data: topProducts } = await supabase
    .from("rentals")
    .select(
      `
      product_id,
      product:products(name, price_per_rental, designer:designers(name))
    `
    )
    .not("status", "eq", "cancelled");

  const productRentals: Record<
    string,
    { name: string; designer: string; count: number; revenue: number }
  > = {};
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

  const { data: rentalStatusData } = await supabase
    .from("rentals")
    .select("status");

  const rentalStatusCounts: Record<string, number> = {};
  (rentalStatusData as RentalData[] | null)?.forEach((r) => {
    rentalStatusCounts[r.status] = (rentalStatusCounts[r.status] || 0) + 1;
  });

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
    "bg-[var(--foreground)]/20",
    "bg-[var(--gold)]",
    "bg-[#62130e]",
    "bg-[var(--olive)]",
  ];

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
          <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
            Insights
          </p>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
          Analytics
        </h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            Total Revenue
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            Total Members
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            {totalMembers}
          </p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            Paid Members
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            {paidMembers}
          </p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            Conversion
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            {totalMembers > 0
              ? ((paidMembers / totalMembers) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Revenue Chart */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Monthly Revenue
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
          </div>
          {monthlyRevenue.length > 0 ? (
            <div className="space-y-4">
              {monthlyRevenue.slice(-6).map((item) => {
                const maxRevenue = Math.max(
                  ...monthlyRevenue.map((r) => r.total)
                );
                const percentage =
                  maxRevenue > 0 ? (item.total / maxRevenue) * 100 : 0;

                return (
                  <div key={item.month}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--foreground)]/60 font-editorial">
                        {item.month}
                      </span>
                      <span className="font-editorial text-[var(--foreground)]">
                        ${item.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--gold)]/10 overflow-hidden">
                      <div
                        className="h-full bg-[#62130e] transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-editorial text-[var(--foreground)]/50 italic text-sm">
              No revenue data yet
            </p>
          )}
        </div>

        {/* Membership Distribution */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Membership Distribution
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3].map((tier) => {
              const count = tierCounts[tier] || 0;
              const percentage =
                totalMembers > 0 ? (count / totalMembers) * 100 : 0;

              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--foreground)]/60 font-editorial">
                      {tierNames[tier]}
                    </span>
                    <span className="font-editorial text-[var(--foreground)]">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--gold)]/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${tierColors[tier]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Rental Status Overview */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Rental Status
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(rentalStatusCounts).map(([status, count]) => (
              <div
                key={status}
                className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10"
              >
                <p className="text-[9px] text-[var(--gold)] font-button tracking-[0.15em] uppercase mb-1">
                  {status.replace(/_/g, " ")}
                </p>
                <p className="font-display text-2xl text-[var(--foreground)]">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Top Products
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
          </div>
          {topProductsList.length > 0 ? (
            <div className="space-y-4">
              {topProductsList.slice(0, 5).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-[var(--gold)]/10 last:border-0"
                >
                  <div>
                    <p className="font-editorial text-[var(--foreground)] text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50 italic">
                      {product.designer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-editorial text-[var(--foreground)]">
                      {product.count} rentals
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50">
                      ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-editorial text-[var(--foreground)]/50 italic text-sm">
              No rental data yet
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Recent Orders
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--gold)]/10 last:border-0"
                >
                  <div>
                    <p className="font-editorial text-[var(--foreground)]">
                      ${order.amount}
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
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
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-lg text-[var(--foreground)] tracking-wide">
              Recent Rentals
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--gold)]/10" />
          </div>
          {recentRentals && recentRentals.length > 0 ? (
            <div className="space-y-4">
              {recentRentals.map((rental: any) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--gold)]/10 last:border-0"
                >
                  <div>
                    <p className="font-editorial text-[var(--foreground)] text-sm">
                      {rental.product?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50">
                      {new Date(rental.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--foreground)]/60 font-editorial">
                    {rental.status.replace(/_/g, " ")}
                  </span>
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
