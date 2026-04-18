"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is logged in and needs to change password
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", user.id)
        .single();

      if (!profile?.must_change_password) {
        // User doesn't need to change password, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Clear the must_change_password flag
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    // Redirect to dashboard
    router.push("/dashboard");
    router.refresh();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
        <p className="font-editorial text-[var(--foreground)]/60">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/vindtia-textured-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C4B99A] to-transparent" />
        <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
      </div>
      <div className="absolute top-8 right-8 w-16 h-16 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#C4B99A] to-transparent" />
        <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
      </div>
      <div className="absolute bottom-8 left-8 w-16 h-16 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C4B99A] to-transparent" />
        <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-[#C4B99A] to-transparent" />
      </div>
      <div className="absolute bottom-8 right-8 w-16 h-16 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#C4B99A] to-transparent" />
        <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-[#C4B99A] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-[#F5F0E8] p-8 lg:p-10 relative overflow-hidden">
          {/* Card corner accents */}
          <div className="absolute top-4 left-4 w-8 h-8 pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#62130e] to-transparent" />
            <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#62130e] to-transparent" />
          </div>
          <div className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none opacity-20">
            <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#62130e] to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-[#62130e] to-transparent" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="font-display text-3xl tracking-[0.2em] text-[#62130e] mb-3">
                VINDTIA
              </h1>
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-[#C4B99A]/50" />
              <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
                Set New Password
              </p>
              <div className="w-8 h-[1px] bg-[#C4B99A]/50" />
            </div>
            <p className="font-editorial text-[var(--foreground)]/60 italic text-sm">
              Please create a new password to continue
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-[10px] tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-2"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-[#C4B99A]/30 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[#62130e]/50 disabled:opacity-50 transition-colors"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[10px] tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-[#C4B99A]/30 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[#62130e]/50 disabled:opacity-50 transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <p className="text-sm text-[#62130e] font-editorial">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-button w-full px-6 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500"
            >
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
