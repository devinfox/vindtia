import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type SearchParams = Promise<{ rental_id?: string }>;

export default async function RentalSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get rental details
  const { data: rental } = await supabase
    .from("rentals")
    .select(
      `
      *,
      product:products(
        name,
        designer:designers(name)
      )
    `
    )
    .eq("id", params.rental_id || "")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/">
            <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">
              VINDTIA
            </h1>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-4">
          Rental Confirmed!
        </h2>

        {rental ? (
          <>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              Your rental of{" "}
              <span className="font-medium text-black dark:text-white">
                {rental.product?.name}
              </span>
              {rental.product?.designer?.name && (
                <> by {rental.product.designer.name}</>
              )}{" "}
              has been confirmed.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-black dark:text-white mb-4">
                Rental Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Rental Period
                  </span>
                  <span className="text-black dark:text-white">
                    {new Date(rental.start_date).toLocaleDateString()} -{" "}
                    {new Date(rental.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Status
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {rental.status === "pending" ? "Processing" : rental.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
              We'll send you a confirmation email with shipping details shortly.
            </p>
          </>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Your rental has been processed successfully.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            View My Rentals
          </Link>
          <Link
            href="/storefront"
            className="px-6 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
