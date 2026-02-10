import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import RentalCalendar from "@/components/RentalCalendar";

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
  let rentalsThisMonth = 0;

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

    // Count rentals this month
    if (userTier > 0) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("rentals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("status", "in", '("cancelled","returned","completed")')
        .gte("created_at", startOfMonth.toISOString());

      rentalsThisMonth = count || 0;
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
      rentalsThisMonth < tierInfo?.monthly_rental_limit);

  const rentalsRemaining =
    tierInfo?.monthly_rental_limit !== null
      ? Math.max(0, (tierInfo?.monthly_rental_limit || 0) - rentalsThisMonth)
      : null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/storefront">
              <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">
                VINDTIA
              </h1>
            </Link>
            <Link
              href="/storefront"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              ← Back to Archive
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div>
            <ProductGallery media={sortedMedia} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Tier Badge */}
            {product.tier_required > 0 && (
              <div className="inline-block px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded">
                Tier {product.tier_required} Required
              </div>
            )}

            {/* Title & Designer */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
                {product.name}
              </h1>
              {product.designer && (
                <p className="text-xl text-zinc-600 dark:text-zinc-400">
                  {product.designer.name}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="border-t border-b border-zinc-200 dark:border-zinc-800 py-4">
              <p className="text-3xl font-bold text-black dark:text-white">
                ${product.price_per_rental.toFixed(0)}
                <span className="text-lg font-normal text-zinc-600 dark:text-zinc-400">
                  {" "}
                  / rental
                </span>
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {product.era && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Era
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {product.era}
                  </span>
                </div>
              )}
              {product.size && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Size
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {product.size}
                  </span>
                </div>
              )}
              {product.color && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Color
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {product.color}
                  </span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Material
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {product.material}
                  </span>
                </div>
              )}
              {product.category && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Category
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {product.category}
                  </span>
                </div>
              )}
              {product.condition && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Condition
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {product.condition}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Availability
                </span>
                <span
                  className={`text-sm font-medium ${
                    inStock
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-black dark:text-white mb-2 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Designer Info */}
            {product.designer?.bio && (
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-black dark:text-white mb-2 uppercase tracking-wider">
                  About {product.designer.name}
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {product.designer.bio}
                </p>
              </div>
            )}

            {/* Rental Calendar or CTA */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
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
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                          This item is currently out of stock.
                        </p>
                        <button
                          disabled
                          className="w-full px-6 py-4 rounded-md bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-500 font-medium cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        This piece requires Tier {product.tier_required} membership.
                      </p>
                      <Link
                        href="/upgrade"
                        className="inline-block w-full px-6 py-4 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-center"
                      >
                        Upgrade to Tier {product.tier_required}
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      You need a membership to rent this piece.
                    </p>
                    <Link
                      href="/upgrade"
                      className="inline-block w-full px-6 py-4 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-center"
                    >
                      View Membership Options
                    </Link>
                  </div>
                )
              ) : (
                <Link
                  href="/auth/signup"
                  className="block w-full px-6 py-4 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-center"
                >
                  Sign up to rent
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
