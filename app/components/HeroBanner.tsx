"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type HeroBannerProps = {
  isLoggedIn: boolean;
};

export default function HeroBanner({ isLoggedIn }: HeroBannerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Stagger the content fade-in
    const contentTimer = setTimeout(() => {
      setContentVisible(true);
    }, 300);

    // After 5 seconds, fade to video (desktop only)
    const videoTimer = setTimeout(() => {
      setShowVideo(true);
    }, 5000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(videoTimer);
    };
  }, []);

  return (
    <>
      {/* === MOBILE VERSION === */}
      <div className="md:hidden absolute inset-0">
        {/* Mobile Background Image with fade out */}
        <Image
          src="/vindtia-homepage-banner-mobile.jpg"
          alt=""
          fill
          priority
          className={`object-cover object-center transition-opacity duration-1000 ${
            showVideo ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Mobile Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/instagram-hero-video-mobile.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay for mobile */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)
            `,
          }}
        />

        {/* Vignette for mobile */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)",
          }}
        />

        {/* Mobile Initial Content (visible during image) */}
        <div
          className={`absolute inset-0 z-10 flex flex-col px-6 transition-all duration-1000 ${
            showVideo ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Top Content */}
          <div
            className={`flex flex-col items-center text-center pt-24 transition-all duration-1000 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Eyebrow with decorative lines */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-[1px] bg-[#C4B99A]/60" />
              <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
                Archive Couture
              </p>
              <div className="w-6 h-[1px] bg-[#C4B99A]/60" />
            </div>

            {/* Main Heading */}
            <h2 className="font-editorial text-[2.5rem] text-[#E8E0D0] tracking-[0.02em] leading-[1.15]">
              Some garments belong
              <br />
              in museums.
            </h2>
            <p className="font-editorial italic text-[2.5rem] text-[#cc0001] mt-2 drop-shadow-[0_0_20px_rgba(204,0,1,0.3)]">
              Others belong on you.
            </p>
          </div>

          {/* Bottom Buttons - Initial (gold bordered) */}
          <div
            className={`absolute left-0 right-0 bottom-[20%] flex flex-row gap-3 justify-center px-6 transition-all duration-1000 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <Link
              href="/storefront"
              className="font-button px-7 py-4 border border-[#C4B99A]/50 text-[#E8E0D0] text-[11px] tracking-[0.15em] uppercase transition-all duration-500 hover:border-[#C4B99A]/80 hover:bg-[#C4B99A]/10"
            >
              Explore the Archive
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="font-button px-7 py-4 border border-[#C4B99A]/50 text-[#E8E0D0] text-[11px] tracking-[0.15em] uppercase transition-all duration-500 hover:border-[#C4B99A]/80 hover:bg-[#C4B99A]/10"
              >
                Your Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="font-button px-7 py-4 border border-[#C4B99A]/50 text-[#E8E0D0] text-[11px] tracking-[0.15em] uppercase transition-all duration-500 hover:border-[#C4B99A]/80 hover:bg-[#C4B99A]/10"
              >
                Join Now
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Video Content - Bottom Center (visible during video) */}
        <div
          className={`absolute inset-0 z-10 flex items-end justify-center pb-[55%] transition-all duration-1000 ${
            showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-3">
              <Link
                href="/storefront"
                className="font-button group relative px-7 py-4 bg-[#62130e] text-[#E8E0D0] text-[11px] tracking-[0.15em] uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(98,19,14,0.4)]"
              >
                <span className="relative z-10">Explore the Archive</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="font-button group relative px-7 py-4 bg-[#62130e] text-[#E8E0D0] text-[11px] tracking-[0.15em] uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(98,19,14,0.4)]"
                >
                  <span className="relative z-10">Your Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="font-button group relative px-7 py-4 bg-[#62130e] text-[#E8E0D0] text-[11px] tracking-[0.15em] uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(98,19,14,0.4)]"
                >
                  <span className="relative z-10">Join Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === DESKTOP VERSION === */}
      <div className="hidden md:block">
        {/* Background Image with Ken Burns effect */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/banner-image.jpg"
            alt=""
            fill
            priority
            className={`object-cover object-center transition-all duration-[8000ms] ease-out ${
              showVideo ? "opacity-0 scale-100" : "opacity-100 scale-105"
            }`}
            style={{
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/vindtia-video-banner.mp4" type="video/mp4" />
        </video>

        {/* Cinematic gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%),
              linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)
            `,
          }}
        />

        {/* Subtle film grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%)",
          }}
        />

        {/* Subtle ambient light effect */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-[2000ms] ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          style={{
            background: "radial-gradient(ellipse at 20% 50%, rgba(196,185,154,0.08) 0%, transparent 50%)",
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-8 left-8 w-16 h-16 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C4B99A] to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
        </div>
        <div className="absolute top-8 right-8 w-16 h-16 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#C4B99A] to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-[#C4B99A] to-transparent" />
        </div>

        {/* Initial Content - Left Aligned (visible during image) */}
        <div
          className={`absolute inset-0 z-10 flex items-center transition-all duration-1000 ${
            showVideo ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="w-full pl-8 lg:pl-16 xl:pl-24">
            <div className="max-w-2xl">
              {/* Eyebrow with animated line */}
              <div
                className={`flex items-center gap-4 mb-10 transition-all duration-1000 ${
                  contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="w-8 h-[1px] bg-[#C4B99A]/60" />
                <p className="text-[#C4B99A] text-xs tracking-[0.4em] uppercase">
                  Archive Couture
                </p>
              </div>

              {/* Main Heading with staggered animation */}
              <h2
                className={`font-editorial text-4xl lg:text-5xl xl:text-6xl text-[#E8E0D0] tracking-[0.04em] mb-12 transition-all duration-1000 ${
                  contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <span className="leading-[1.05] block">
                  Some garments belong
                  <br />
                  in museums.
                </span>
                <span className="italic text-[#cc0001] drop-shadow-[0_0_30px_rgba(204,0,1,0.3)] block mt-2">
                  Others belong on you.
                </span>
              </h2>

              {/* CTAs with enhanced hover */}
              <div
                className={`flex flex-row gap-4 transition-all duration-1000 ${
                  contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                <Link
                  href="/storefront"
                  className="font-button group relative px-6 lg:px-8 py-3 lg:py-4 border border-[#C4B99A]/40 text-[#E8E0D0] text-[10px] lg:text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:border-[#C4B99A]/80 hover:shadow-[0_0_30px_rgba(196,185,154,0.15)]"
                >
                  <span className="relative z-10">Explore the Archive</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C4B99A]/0 via-[#C4B99A]/10 to-[#C4B99A]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="font-button group relative px-6 lg:px-8 py-3 lg:py-4 border border-[#C4B99A]/40 text-[#E8E0D0] text-[10px] lg:text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:border-[#C4B99A]/80 hover:shadow-[0_0_30px_rgba(196,185,154,0.15)]"
                  >
                    <span className="relative z-10">Your Dashboard</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C4B99A]/0 via-[#C4B99A]/10 to-[#C4B99A]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="font-button group relative px-6 lg:px-8 py-3 lg:py-4 border border-[#C4B99A]/40 text-[#E8E0D0] text-[10px] lg:text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:border-[#C4B99A]/80 hover:shadow-[0_0_30px_rgba(196,185,154,0.15)]"
                  >
                    <span className="relative z-10">Apply for Membership</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C4B99A]/0 via-[#C4B99A]/10 to-[#C4B99A]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Content - Bottom Center (visible during video) */}
        <div
          className={`absolute inset-0 z-10 flex items-end justify-center pb-[15%] transition-all duration-1000 ${
            showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-4">
              <Link
                href="/storefront"
                className="font-button group relative px-8 lg:px-10 py-3 lg:py-4 bg-[#62130e] text-[#E8E0D0] text-[10px] lg:text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(98,19,14,0.4)]"
              >
                <span className="relative z-10">Explore the Archive</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="font-button group relative px-8 lg:px-10 py-3 lg:py-4 bg-[#62130e] text-[#E8E0D0] text-[10px] lg:text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(98,19,14,0.4)]"
                >
                  <span className="relative z-10">Your Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="font-button group relative px-8 lg:px-10 py-3 lg:py-4 bg-[#62130e] text-[#E8E0D0] text-[10px] lg:text-xs tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(98,19,14,0.4)]"
                >
                  <span className="relative z-10">Apply for Membership</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
