import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin">
                <h1 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-500">
                  VINDTIA
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-500 font-normal">
                    ADMIN
                  </span>
                </h1>
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/admin"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/designers"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Designers
                </Link>
                <Link
                  href="/admin/products"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Products
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Orders
                </Link>
                <Link
                  href="/admin/rentals"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Rentals
                </Link>
                <Link
                  href="/admin/cleaning"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Cleaning
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/storefront"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                View Storefront
              </Link>
              <Link
                href="/"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
