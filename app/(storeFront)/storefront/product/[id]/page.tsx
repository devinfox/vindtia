import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import RentalCalendar from "@/components/RentalCalendar";
import Navbar from "@/components/Navbar";
import ProductAccordion from "@/components/ProductAccordion";

type Params = Promise<{ id: string }>;

export default async function ProductDetailPage(props: { params: Params }) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's membership tier and rental info
  let userTier = 0;
  let tierInfo = null;
  let rentalsInWindow = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("membership_tier")
      .eq("id", user.id)
      .single();
    userTier = profile?.membership_tier || 0;

    // Get tier info
    const { data: tier } = await supabase
      .from("membership_tiers")
      .select("*")
      .eq("id", userTier)
      .single();
    tierInfo = tier;

    // Count rentals in the rolling window (default 14 days)
    if (userTier > 0) {
      const windowDays = tierInfo?.rental_window_days || 14;
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - windowDays);
      windowStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("rentals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("status", "in", '("cancelled","returned","completed")')
        .gte("created_at", windowStart.toISOString());

      rentalsInWindow = count || 0;
    }
  }

  // Fetch product with relations
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      designer:designers(id, name, bio, image_url),
      media:product_media(id, url, sort_order),
      inventory:inventory(quantity)
    `
    )
    .eq("id", params.id)
    .eq("archive", false)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch booked dates for this product
  const { data: bookedRentals } = await supabase
    .from("rentals")
    .select("start_date, end_date")
    .eq("product_id", params.id)
    .not("status", "in", '("cancelled","returned","completed")');

  // Sort media by sort_order
  const sortedMedia = product.media.sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  const inStock =
    product.inventory && product.inventory.length > 0
      ? product.inventory[0].quantity > 0
      : false;

  // Calculate if user can rent
  const canRent =
    user &&
    userTier > 0 &&
    userTier >= product.tier_required &&
    inStock &&
    (tierInfo?.monthly_rental_limit === null ||
      tierInfo?.monthly_rental_limit === 0 ||
      rentalsInWindow < tierInfo?.monthly_rental_limit);

  const rentalsRemaining =
    tierInfo?.monthly_rental_limit !== null && tierInfo?.monthly_rental_limit > 0
      ? Math.max(0, (tierInfo?.monthly_rental_limit || 0) - rentalsInWindow)
      : null;

  const rentalWindowDays = tierInfo?.rental_window_days || 14;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[var(--background-deep)] border-b border-[var(--gold)]/10 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/storefront"
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--gold)] transition-colors font-editorial"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to The Archive
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery media={sortedMedia} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Tier Badge */}
            {product.tier_required > 0 && (
              <div className="inline-block px-4 py-2 bg-[var(--espresso)] border border-[var(--gold)]/20">
                <span className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase">
                  Tier {product.tier_required} Required
                </span>
              </div>
            )}

            {/* Designer & Title */}
            <div>
              {product.designer && (
                <p className="text-[var(--gold)] text-sm tracking-[0.2em] uppercase mb-3">
                  {product.designer.name}
                </p>
              )}
              <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="py-6 border-t border-b border-[var(--gold)]/20">
              <p className="font-display text-3xl text-[var(--foreground)]">
                ${product.price_per_rental.toFixed(0)}
                <span className="font-editorial text-lg text-[var(--foreground)]/50 ml-2">
                  per rental
                </span>
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {product.era && (
                <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                    Era
                  </span>
                  <span className="font-editorial text-[var(--foreground)]">
                    {product.era}
                  </span>
                </div>
              )}
              {product.size && (
                <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                    Size
                  </span>
                  <span className="font-editorial text-[var(--foreground)]">
                    {product.size}
                  </span>
                </div>
              )}
              {product.color && (
                <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                    Color
                  </span>
                  <span className="font-editorial text-[var(--foreground)]">
                    {product.color}
                  </span>
                </div>
              )}
              {product.material && (
                <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                    Material
                  </span>
                  <span className="font-editorial text-[var(--foreground)]">
                    {product.material}
                  </span>
                </div>
              )}
              {product.category && (
                <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                    Category
                  </span>
                  <span className="font-editorial text-[var(--foreground)]">
                    {product.category}
                  </span>
                </div>
              )}
              {product.condition && (
                <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                    Condition
                  </span>
                  <span className="font-editorial text-[var(--foreground)]">
                    {product.condition}
                  </span>
                </div>
              )}
              <div className="p-4 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                <span className="block text-xs tracking-[0.15em] uppercase text-[var(--foreground)]/50 mb-1">
                  Availability
                </span>
                <span className={`font-editorial ${
                  inStock ? "text-[var(--olive)]" : "text-[#62130e]"
                }`}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Description Accordion */}
            {product.description && (
              <ProductAccordion title="About This Piece" defaultOpen={false}>
                <p className="font-editorial text-[var(--foreground)]/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </ProductAccordion>
            )}

            {/* Designer Info Accordion */}
            {product.designer?.bio && (
              <ProductAccordion title={`About ${product.designer.name}`} defaultOpen={false}>
                <p className="font-editorial text-[var(--foreground)]/80 leading-relaxed">
                  {product.designer.bio}
                </p>
              </ProductAccordion>
            )}

            {/* Rental Calendar or CTA */}
            <div className="pt-6 border-t border-[var(--gold)]/10">
              {user ? (
                userTier > 0 ? (
                  userTier >= product.tier_required ? (
                    inStock ? (
                      <RentalCalendar
                        productId={product.id}
                        productName={product.name}
                        pricePerRental={product.price_per_rental}
                        userTier={userTier}
                        maxDuration={tierInfo?.rental_duration_days || 7}
                        bookedDates={bookedRentals || []}
                        canRent={canRent}
                        rentalsRemaining={rentalsRemaining}
                        rentalWindowDays={rentalWindowDays}
                      />
                    ) : (
                      <div className="text-center py-10 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                        <p className="font-editorial text-[var(--foreground)]/60 mb-6">
                          This item is currently out of stock.
                        </p>
                        <button
                          disabled
                          className="w-full px-8 py-4 bg-[var(--foreground)]/20 text-[var(--foreground)]/40 text-xs tracking-[0.2em] uppercase cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-10 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                      <p className="font-editorial text-[var(--foreground)]/60 mb-6">
                        This piece requires Tier {product.tier_required} membership.
                      </p>
                      <Link
                        href="/upgrade"
                        className="inline-block w-full px-8 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-luxury text-center"
                      >
                        Upgrade to Tier {product.tier_required}
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center py-10 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                    <p className="font-editorial text-[var(--foreground)]/60 mb-6">
                      You need a membership to rent this piece.
                    </p>
                    <Link
                      href="/upgrade"
                      className="inline-block w-full px-8 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-luxury text-center"
                    >
                      View Membership Options
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center py-10 bg-[var(--background-warm)] border border-[var(--gold)]/10">
                  <p className="font-editorial text-[var(--foreground)]/60 mb-6">
                    Sign up to rent this archive piece.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-block w-full px-8 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-luxury text-center"
                  >
                    Apply for Membership
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-[#F5F0E8]/60 mt-16" style={{ backgroundImage: "url('/vindtia-textured-background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-editorial text-sm tracking-wider">
            Archive Couture, Reimagined
          </p>
          <div className="rule-gold w-16 mx-auto mt-6" />
        </div>
      </footer>
    </div>
  );
}
