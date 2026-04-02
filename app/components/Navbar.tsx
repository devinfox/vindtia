"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  sticky?: boolean;
  transparent?: boolean;
}

export default function Navbar({ sticky = false, transparent = true }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sticky]);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: adminRole } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        setIsAdmin(!!adminRole);
      }
    };

    checkAdmin();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isTransparent = transparent && !scrolled;

  return (
    <>
    <header
      className={`${sticky ? "fixed" : "absolute"} top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/storefront"
              className={`text-xs tracking-[0.15em] uppercase transition-colors duration-500 ${
                isTransparent
                  ? "text-[#E8E0D0]/70 hover:text-[#E8E0D0]"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Archive
            </Link>
            <Link
              href="/designers"
              className={`text-xs tracking-[0.15em] uppercase transition-colors duration-500 ${
                isTransparent
                  ? "text-[#E8E0D0]/70 hover:text-[#E8E0D0]"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Designers
            </Link>
          </nav>

          {/* Center Logo */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 font-display text-2xl lg:text-3xl tracking-[0.25em] transition-colors duration-500 ${
              isTransparent
                ? "text-[#E8E0D0]"
                : "text-red-600"
            }`}
          >
            VINDTIA
          </Link>

          {/* Right Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/membership"
              className={`text-xs tracking-[0.15em] uppercase transition-colors duration-500 ${
                isTransparent
                  ? "text-[#E8E0D0]/70 hover:text-[#E8E0D0]"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Membership
            </Link>
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className={`text-xs tracking-[0.15em] uppercase transition-colors duration-500 ${
                isTransparent
                  ? "text-[#E8E0D0]/70 hover:text-[#E8E0D0]"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Account
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`md:hidden p-2 transition-colors duration-500 ${
              isTransparent ? "text-[#E8E0D0]" : "text-black"
            }`}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    <div
      className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-[280px] bg-[#62130e] transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-5 right-5 p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Menu Content */}
        <div className="flex flex-col h-full pt-20 pb-8 px-8">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display text-2xl tracking-[0.25em] text-white mb-10"
          >
            VINDTIA
          </Link>

          {/* Decorative line */}
          <div className="w-12 h-px bg-white/20 mb-8" />

          {/* Nav Links */}
          <nav className="flex flex-col gap-6">
            <Link
              href="/storefront"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors"
            >
              Archive
            </Link>
            <Link
              href="/designers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors"
            >
              Designers
            </Link>
            <Link
              href="/membership"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors"
            >
              Membership
            </Link>
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors"
            >
              Account
            </Link>
          </nav>

          {/* Bottom decorative element */}
          <div className="mt-auto">
            <div className="w-8 h-px bg-white/20 mb-4" />
            <p className="font-editorial text-xs text-white/40 italic">
              Archive Couture, Reimagined
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
