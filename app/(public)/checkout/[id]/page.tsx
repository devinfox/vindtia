import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CheckoutForm from "@/components/CheckoutForm";

type Params = Promise<{ id: string }>;

export default async function CheckoutPage(props: { params: Params }) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/checkout/${params.id}`);
  }

  // Fetch the rental with product info
  const { data: rental } = await supabase
    .from("rentals")
    .select(
      `
      *,
      product:products(
        id,
        name,
        price_per_rental,
        designer:designers(name),
        media:product_media(url, sort_order)
      )
    `
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!rental) {
    notFound();
  }

  // If already paid, redirect to dashboard
  if (rental.status !== "pending") {
    redirect("/dashboard");
  }

  // Get user profile for Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, name, email")
    .eq("id", user.id)
    .single();

  const productImage =
    rental.product?.media?.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    )[0]?.url || null;

  // Calculate rental details
  const startDate = new Date(rental.start_date);
  const endDate = new Date(rental.end_date);
  const duration =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

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
            <Link
              href={`/storefront/product/${rental.product?.id}`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              ← Back to Product
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-8">
          Complete Your Rental
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Order Summary
            </h3>

            <div className="flex gap-4 mb-6">
              {productImage && (
                <img
                  src={productImage}
                  alt={rental.product?.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-medium text-black dark:text-white">
                  {rental.product?.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {rental.product?.designer?.name}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Rental Period
                </span>
                <span className="text-black dark:text-white">
                  {startDate.toLocaleDateString()} -{" "}
                  {endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Duration
                </span>
                <span className="text-black dark:text-white">
                  {duration} days
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="font-medium text-black dark:text-white">
                  Total
                </span>
                <span className="font-bold text-black dark:text-white">
                  ${rental.product?.price_per_rental.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <CheckoutForm
              rentalId={rental.id}
              amount={rental.product?.price_per_rental || 0}
              stripeCustomerId={profile?.stripe_customer_id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
