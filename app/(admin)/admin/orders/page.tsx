import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      user:profiles(id, email, name),
      rental:rentals(
        id,
        start_date,
        end_date,
        product:products(id, name)
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
          <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
            Transactions
          </p>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
          Orders
        </h1>
      </div>

      {orders && orders.length > 0 ? (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--background-warm)] border-b border-[var(--gold)]/10">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gold)]/10">
              {orders.map((order: any) => (
                <tr
                  key={order.id}
                  className="hover:bg-[var(--gold)]/5 transition-colors duration-300"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-[var(--foreground)]/50">
                      {order.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-editorial text-[var(--foreground)] text-sm">
                        {order.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-[var(--foreground)]/50 italic">
                        {order.user?.email || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-editorial text-[var(--foreground)] text-sm">
                      {order.rental?.product?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-editorial text-[var(--foreground)]">
                      ${order.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-button text-[9px] tracking-[0.1em] uppercase px-2 py-1 ${
                        order.status === "completed"
                          ? "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20"
                          : order.status === "pending"
                          ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20"
                          : "bg-[var(--foreground)]/5 text-[var(--foreground)]/50 border border-[var(--foreground)]/10"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--foreground)]/60">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-12 text-center">
          <p className="font-editorial text-[var(--foreground)]/60 italic">
            No orders yet.
          </p>
        </div>
      )}
    </div>
  );
}
