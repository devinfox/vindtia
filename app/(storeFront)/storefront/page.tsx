import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <Navbar transparent={true} sticky={true} />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-14 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/vindtia-textured-background.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="text-[var(--gold)] text-xs tracking-[0.35em] uppercase mb-4">
            Curated Collection
          </p>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl text-[#F5F0E8] mb-4 tracking-[0.35em] uppercase">
            The Archive
          </h1>
          <p className="font-editorial text-lg text-[#F5F0E8]/70 italic max-w-xl mx-auto">
            Rare vintage couture, <span className="text-[var(--gold)]">authenticated</span> and ready to wear.
          </p>
        </div>
      </section>

      {/* Filters Section - Horizontal under banner */}
      <section className="py-8 lg:py-10 bg-[var(--background-warm)] border-b border-[var(--gold)]/10">
        <div className="w-full px-[5%] lg:px-[10%]">
          <Suspense fallback={
            <div className="flex items-center justify-center gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-16 h-16 bg-[var(--background-deep)] mb-3" />
                  <div className="w-12 h-3 bg-[var(--background-deep)] mx-auto" />
                </div>
              ))}
            </div>
          }>
            <ProductFilters filterOptions={filterOptions} userTier={userTier} />
          </Suspense>
        </div>
      </section>

      {/* Membership Status Bar */}
      <div className="bg-[var(--background-deep)] border-b border-[var(--gold)]/10 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-editorial text-[var(--foreground)]/70 text-sm">
              {user
                ? <>Membership Tier: <span className="text-[#62130e] font-medium">{userTier}</span> &mdash; Showing pieces available at your level</>
                : "Browsing as guest — Sign up to unlock exclusive pieces"}
            </p>
            {!user && (
              <Link
                href="/signup"
                className="font-button text-xs tracking-[0.15em] uppercase text-[var(--gold)] hover:text-[#62130e] transition-colors flex items-center gap-2"
              >
                Apply for Membership
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Products Grid */}
      <section className="py-12 lg:py-16 bg-[var(--background-warm)] texture-paper">
        <div className="max-w-7xl mx-auto px-6">
          {products && products.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <p className="font-editorial text-[var(--foreground)]/60 text-sm italic">
                  {products.length} piece{products.length !== 1 ? "s" : ""} in the collection
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="text-center py-24 bg-[var(--background)] border border-[var(--gold)]/10">
              <div className="max-w-md mx-auto">
                <p className="font-display text-2xl text-[var(--foreground)] mb-4">
                  {userTier === 0
                    ? "Unlock the Archive"
                    : "No Pieces Found"}
                </p>
                <p className="font-editorial text-[var(--foreground)]/60 mb-8">
                  {userTier === 0
                    ? "Membership unlocks access to our curated collection of rare vintage couture."
                    : "Try adjusting your filters to discover more pieces."}
                </p>
                {userTier === 0 && (
                  <Link
                    href="/upgrade"
                    className="font-button inline-block px-10 py-4 border-2 border-[#62130e] text-[#62130e] text-xs tracking-[0.2em] uppercase hover:bg-[#62130e] hover:text-[#F5F0E8] transition-luxury"
                  >
                    View Membership Tiers
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 text-[#F5F0E8]/60 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/vindtia-textured-background.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Refined dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Top decorative border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span className="font-display text-2xl lg:text-3xl tracking-[0.3em] text-white block mb-4 drop-shadow-lg">
            VINDTIA
          </span>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent mx-auto mb-4" />
          <p className="font-editorial text-sm tracking-[0.1em] text-[#F5F0E8]/60 italic">
            Archive Couture, Reimagined
          </p>
        </div>
      </footer>
    </div>
  );
}
