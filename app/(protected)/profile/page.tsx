import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch tier info
  const { data: tierInfo } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("id", profile?.membership_tier || 0)
    .single();

  const tierNames = ["Complimentary", "Atelier", "Maison", "Haute Couture"];

  // Check if body profile is set up
  const hasBodyProfile = profile?.skin_tone || profile?.body_type || profile?.front_photo_url;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5DED5]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/home" className="text-sm text-[#8B7355] hover:text-[#3D2E26] transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-display text-[#3D2E26] mt-4">My Account</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Overview */}
        <section className="bg-white rounded-xl border border-[#E5DED5] p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full bg-[#F5F0E8] overflow-hidden border-2 border-[#E5DED5]">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8B7355]">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-display text-[#3D2E26]">
                {profile?.name || user.email?.split("@")[0] || "Member"}
              </h2>
              <p className="text-sm text-[#8B7355]">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 text-xs bg-[#62130e]/10 text-[#62130e] rounded-full">
                  {tierNames[profile?.membership_tier || 0]}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Body Profile Card */}
          <Link
            href="/profile/settings"
            className="group bg-white rounded-xl border border-[#E5DED5] p-6 hover:border-[#B8A06A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#B8A06A]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#B8A06A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {!hasBodyProfile && (
                <span className="px-2 py-1 text-[10px] bg-[#B8A06A]/20 text-[#8B7355] rounded-full">
                  Set Up
                </span>
              )}
            </div>
            <h3 className="text-lg font-display text-[#3D2E26] mb-2 group-hover:text-[#62130e] transition-colors">
              Body Profile
            </h3>
            <p className="text-sm text-[#8B7355] mb-4">
              {hasBodyProfile
                ? "Update your measurements and photos for personalized AI styling"
                : "Add your photos and measurements for personalized outfit visualizations"}
            </p>
            {hasBodyProfile ? (
              <div className="flex flex-wrap gap-2">
                {profile?.body_type && (
                  <span className="px-2 py-1 text-[10px] bg-[#F5F0E8] text-[#3D2E26] rounded">
                    {profile.body_type}
                  </span>
                )}
                {profile?.skin_tone && (
                  <span className="px-2 py-1 text-[10px] bg-[#F5F0E8] text-[#3D2E26] rounded">
                    {profile.skin_tone}
                  </span>
                )}
                {profile?.front_photo_url && (
                  <span className="px-2 py-1 text-[10px] bg-[#B8A06A]/20 text-[#8B7355] rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Photo added
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-[#B8A06A] group-hover:text-[#62130e] transition-colors flex items-center gap-1">
                Get started
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </Link>

          {/* Membership Card */}
          <Link
            href="/membership"
            className="group bg-white rounded-xl border border-[#E5DED5] p-6 hover:border-[#62130e]/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#62130e]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#62130e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-display text-[#3D2E26] mb-2 group-hover:text-[#62130e] transition-colors">
              Membership
            </h3>
            <p className="text-sm text-[#8B7355] mb-4">
              Manage your membership tier and billing preferences
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#62130e]">
                {tierNames[profile?.membership_tier || 0]}
              </span>
              <span className="text-xs text-[#8B7355]">
                {tierInfo?.monthly_rental_limit === null
                  ? "Unlimited rentals"
                  : `${tierInfo?.monthly_rental_limit || 0} rentals/month`}
              </span>
            </div>
          </Link>

          {/* Rental History Card */}
          <Link
            href="/rentals"
            className="group bg-white rounded-xl border border-[#E5DED5] p-6 hover:border-[#5C6B4A]/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#5C6B4A]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5C6B4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-display text-[#3D2E26] mb-2 group-hover:text-[#5C6B4A] transition-colors">
              Rental History
            </h3>
            <p className="text-sm text-[#8B7355]">
              View your past and current rentals
            </p>
          </Link>

          {/* Account Settings Card */}
          <div className="bg-white rounded-xl border border-[#E5DED5] p-6 opacity-60">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#8B7355]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="px-2 py-1 text-[10px] bg-[#8B7355]/10 text-[#8B7355] rounded-full">
                Coming Soon
              </span>
            </div>
            <h3 className="text-lg font-display text-[#3D2E26] mb-2">
              Account Settings
            </h3>
            <p className="text-sm text-[#8B7355]">
              Update your email, password, and notification preferences
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-12 text-center">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-[#8B7355] hover:text-[#62130e] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
