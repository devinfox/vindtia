import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import Link from "next/link";
import { Suspense } from "react";

type SearchParams = Promise<{
  designer?: string;
  category?: string;
  era?: string;
  size?: string;
  color?: string;
  material?: string;
}>;

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's membership tier
  let userTier = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("membership_tier")
      .eq("id", user.id)
      .single();
    userTier = profile?.membership_tier || 0;
  }

  // Build query
  let query = supabase
    .from("products")
    .select(
      `
      *,
      designer:designers(id, name, image_url),
      media:product_media(id, url, sort_order)
    `
    )
    .eq("archive", false)
    .order("created_at", { ascending: false });

  // Apply filters
  if (params.designer) {
    query = query.eq("designer_id", params.designer);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.era) {
    query = query.eq("era", params.era);
  }
  if (params.size) {
    query = query.eq("size", params.size);
  }
  if (params.color) {
    query = query.eq("color", params.color);
  }
  if (params.material) {
    query = query.eq("material", params.material);
  }

  const { data: products } = await query;

  // Fetch filter options (all distinct values)
  const [
    { data: designers },
    { data: erasData },
    { data: sizesData },
    { data: colorsData },
    { data: materialsData },
    { data: categoriesData },
  ] = await Promise.all([
    supabase.from("designers").select("id, name").order("name"),
    supabase.from("products").select("era").not("era", "is", null),
    supabase.from("products").select("size").not("size", "is", null),
    supabase.from("products").select("color").not("color", "is", null),
    supabase.from("products").select("material").not("material", "is", null),
    supabase.from("products").select("category").not("category", "is", null),
  ]);

  // Get unique values
  const eras = [...new Set((erasData as { era: string }[] | null)?.map((p) => p.era).filter(Boolean))].sort() as string[];
  const sizes = [...new Set((sizesData as { size: string }[] | null)?.map((p) => p.size).filter(Boolean))] as string[];
  const colors = [...new Set((colorsData as { color: string }[] | null)?.map((p) => p.color).filter(Boolean))].sort() as string[];
  const materials = [...new Set((materialsData as { material: string }[] | null)?.map((p) => p.material).filter(Boolean))].sort() as string[];
  const categories = [...new Set((categoriesData as { category: string }[] | null)?.map((p) => p.category).filter(Boolean))].sort() as string[];

  const filterOptions = {
    designers: designers || [],
    eras,
    sizes,
    colors,
    materials,
    categories,
  };

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
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/membership"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  >
                    Membership
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tier Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
            The Archive
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {user
              ? `Current tier: ${userTier} • Showing pieces available at your level`
              : "Browsing as guest • Sign up to unlock exclusive pieces"}
          </p>
          {!user && (
            <Link
              href="/auth/signup"
              className="inline-block mt-2 text-sm text-red-600 dark:text-red-500 hover:underline"
            >
              Create an account to see more →
            </Link>
          )}
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <Suspense fallback={<div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 h-96 rounded-lg" />}>
                <ProductFilters filterOptions={filterOptions} />
              </Suspense>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {products && products.length > 0 ? (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  {products.length} piece{products.length !== 1 ? "s" : ""} found
                </p>
                <ProductGrid products={products} />
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-zinc-600 dark:text-zinc-400">
                  {userTier === 0
                    ? "No pieces available at your tier. Upgrade to unlock the archive."
                    : "No pieces found. Try adjusting your filters."}
                </p>
                {userTier === 0 && (
                  <Link
                    href="/upgrade"
                    className="inline-block mt-4 px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    View Membership Tiers
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
