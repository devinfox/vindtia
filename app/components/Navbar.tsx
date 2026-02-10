"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavbarProps {
  sticky?: boolean;
  transparent?: boolean;
}

export default function Navbar({ sticky = false, transparent = true }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sticky]);

  const isTransparent = transparent && !scrolled;

  return (
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
              href="/brand/versace"
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
              href="/dashboard"
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
            className={`md:hidden p-2 transition-colors duration-500 ${
              isTransparent ? "text-[#E8E0D0]" : "text-black"
            }`}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
