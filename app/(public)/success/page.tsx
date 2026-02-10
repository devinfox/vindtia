import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SuccessPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-red-600 dark:text-red-500 mb-4">
            VINDTIA
          </h1>
          <div className="inline-block p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
            <svg
              className="w-16 h-16 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white mb-4">
            Welcome to the Archive
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">
            Your membership is now active!
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Current tier: <span className="font-semibold">Tier {profile?.membership_tier || 0}</span>
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/storefront"
            className="block w-full px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Browse the Archive
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
