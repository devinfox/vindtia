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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Orders
      </h1>

      {orders && orders.length > 0 ? (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-black dark:text-white">
                        {order.user?.name || "Unknown"}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {order.user?.email || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">
                    {order.rental?.product?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        order.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : order.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">No orders yet.</p>
        </div>
      )}
    </div>
  );
}
