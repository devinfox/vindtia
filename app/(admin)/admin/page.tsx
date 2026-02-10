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
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("designers").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Total Products
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {productsCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Designers
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {designersCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Total Orders
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {ordersCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Total Users
          </p>
          <p className="text-3xl font-bold text-black dark:text-white">
            {usersCount || 0}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Recent Products
            </h2>
            <Link
              href="/admin/products"
              className="text-sm text-red-600 dark:text-red-500 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentProducts && recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {product.designer?.name || "No designer"}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No products yet
            </p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-red-600 dark:text-red-500 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      ${order.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {order.user?.email || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-medium ${
                        order.status === "completed"
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No orders yet
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/designers/new"
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            + Add Designer
          </Link>
        </div>
      </div>
    </div>
  );
}
