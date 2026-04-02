"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-[10px] tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-2"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#C4B99A]/30 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[#62130e]/50 disabled:opacity-50 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-[10px] tracking-[0.2em] uppercase text-[var(--foreground)]/60 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#C4B99A]/30 text-[var(--foreground)] font-editorial focus:outline-none focus:border-[#62130e]/50 disabled:opacity-50 transition-colors"
          placeholder="Enter your password"
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
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
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
                Member Login
              </p>
              <div className="w-8 h-[1px] bg-[#C4B99A]/50" />
            </div>
            <p className="font-editorial text-[var(--foreground)]/60 italic text-sm">
              Welcome back to the archive
            </p>
          </div>

          <Suspense
            fallback={
              <div className="space-y-5">
                <div className="h-[70px] bg-[#C4B99A]/10 animate-pulse" />
                <div className="h-[70px] bg-[#C4B99A]/10 animate-pulse" />
                <div className="h-[52px] bg-[#C4B99A]/10 animate-pulse" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-8 pt-6 border-t border-[#C4B99A]/20">
            <p className="text-center font-editorial text-sm text-[var(--foreground)]/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#62130e] hover:text-[#4a0f0b] transition-colors"
              >
                Apply for membership
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-button text-[10px] tracking-[0.15em] uppercase text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors flex items-center justify-center gap-2"
          >
            <span>←</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
