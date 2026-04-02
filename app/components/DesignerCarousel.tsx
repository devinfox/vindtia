"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Designer = {
  slug: string;
  name: string;
  banner: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  subtitle: string;
  tagline: string;
  signature: string;
  colors: {
    shopByDesigner: string;
    subtitle: string;
    tagline: string;
    signature: string;
    button: string;
    buttonBorder: string;
    buttonHover: string;
  };
  subtitleStyle?: string;
  signatureStyle?: string;
};

const designers: Designer[] = [
  {
    slug: "versace",
    name: "Versace",
    banner: "/versace-banner.jpg",
    logo: "/versace-logo.png",
    logoWidth: 400,
    logoHeight: 100,
    subtitle: "House of Medusa",
    tagline: "Est. 1978 · Milan, Italy",
    signature: "Baroque prints, Medusa motif, Greek key patterns, and bold use of gold",
    colors: {
      shopByDesigner: "rgba(255,255,255,0.8)",
      subtitle: "#FFFFFF",
      tagline: "rgba(255,255,255,0.7)",
      signature: "rgba(255,255,255,0.85)",
      button: "#FFFFFF",
      buttonBorder: "rgba(198,167,94,0.6)",
      buttonHover: "rgba(198,167,94,0.2)",
    },
    subtitleStyle: "font-editorial italic",
  },
  {
    slug: "giorgio-armani",
    name: "Giorgio Armani",
    banner: "/armani-banner-image.png",
    logo: "/armani-logo.png",
    logoWidth: 550,
    logoHeight: 120,
    subtitle: "Quiet Power. Timeless Form.",
    tagline: "Est. 1975 · Milan, Italy",
    signature: "The art of restraint. Fluid tailoring, neutral palettes, and silhouettes that defined modern elegance.",
    colors: {
      shopByDesigner: "rgba(158,149,138,0.8)",
      subtitle: "#F5F5F0",
      tagline: "rgba(158,149,138,0.7)",
      signature: "rgba(245,245,240,0.75)",
      button: "#F5F5F0",
      buttonBorder: "rgba(158,149,138,0.5)",
      buttonHover: "rgba(158,149,138,0.15)",
    },
    subtitleStyle: "font-editorial italic font-light",
    signatureStyle: "font-light",
  },
  {
    slug: "valentino",
    name: "Valentino",
    banner: "/valentino-banner-image.jpg",
    logo: "/valentino-logo.png",
    logoWidth: 550,
    logoHeight: 120,
    subtitle: "Romance. Grace. Legacy.",
    tagline: "Est. 1960 · Rome, Italy",
    signature: "Where Roman grandeur meets haute couture — a legacy of red, refinement, and timeless femininity.",
    colors: {
      shopByDesigner: "rgba(255,255,255,0.8)",
      subtitle: "#FFFFFF",
      tagline: "rgba(255,255,255,0.7)",
      signature: "rgba(255,255,255,0.9)",
      button: "#FFFFFF",
      buttonBorder: "rgba(190,10,38,0.5)",
      buttonHover: "rgba(190,10,38,0.15)",
    },
    subtitleStyle: "font-editorial italic",
    signatureStyle: "italic",
  },
  {
    slug: "prada",
    name: "Prada",
    banner: "/prada-banner.jpg",
    logo: "/Prada-Logo.png",
    logoWidth: 400,
    logoHeight: 100,
    subtitle: "Intellect. Precision. Subversion.",
    tagline: "Est. 1913 · Milan, Italy",
    signature: "A study in modern femininity — minimal forms, unexpected materials, and quiet disruption from Milan's most cerebral house.",
    colors: {
      shopByDesigner: "rgba(232,224,208,0.7)",
      subtitle: "#E8E0D0",
      tagline: "rgba(232,224,208,0.7)",
      signature: "rgba(232,224,208,0.85)",
      button: "#E8E0D0",
      buttonBorder: "rgba(232,224,208,0.4)",
      buttonHover: "rgba(232,224,208,0.1)",
    },
    subtitleStyle: "font-editorial italic",
  },
];

export default function DesignerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % designers.length);
  }, [currentIndex, goToSlide]);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const d = designers[currentIndex];

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Images - all loaded, opacity controlled */}
      {designers.map((designer, index) => (
        <div
          key={designer.slug}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={designer.banner}
            alt={designer.name}
            fill
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Content - Matching brand landing pages exactly */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div
          className={`transition-all duration-700 ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          {/* Shop by Designer */}
          <p
            className="font-sans text-xs lg:text-sm tracking-[0.4em] uppercase mb-6"
            style={{ color: d.colors.shopByDesigner }}
          >
            Shop by Designer
          </p>

          {/* Logo */}
          <div className="mb-4">
            <Image
              src={d.logo}
              alt={d.name}
              width={d.logoWidth}
              height={d.logoHeight}
              className="mx-auto"
              style={{ filter: "drop-shadow(0 2px 15px rgba(0,0,0,0.5))" }}
            />
          </div>

          {/* Subtitle */}
          <p
            className={`text-xl lg:text-2xl mb-6 ${d.subtitleStyle || ""}`}
            style={{ color: d.colors.subtitle }}
          >
            {d.subtitle}
          </p>

          {/* Tagline */}
          <p
            className="text-sm lg:text-base tracking-[0.2em] uppercase mb-6"
            style={{ color: d.colors.tagline }}
          >
            {d.tagline}
          </p>

          {/* Signature */}
          <p
            className={`font-editorial text-base lg:text-lg max-w-xl mx-auto mb-10 leading-relaxed ${d.signatureStyle || ""}`}
            style={{ color: d.colors.signature }}
          >
            {d.signature}
          </p>

          {/* CTA Button */}
          <Link
            href={`/brand/${d.slug}`}
            className="font-button inline-block px-10 py-4 text-sm tracking-[0.25em] uppercase transition-all duration-500"
            style={{
              color: d.colors.button,
              border: `1px solid ${d.colors.buttonBorder}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = d.colors.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            View Designer Archive
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {designers.map((designer, index) => (
          <button
            key={designer.slug}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? "w-8 h-1 bg-[#C4B99A]"
                : "w-4 h-1 bg-[#C4B99A]/30 hover:bg-[#C4B99A]/50"
            }`}
            aria-label={`Go to ${designer.name}`}
          />
        ))}
      </div>

      {/* Designer Name Pills */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {designers.map((designer, index) => (
          <button
            key={designer.slug}
            onClick={() => goToSlide(index)}
            className={`px-3 py-1 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
              index === currentIndex
                ? "bg-[#C4B99A]/20 text-[#F5F0E8] border border-[#C4B99A]/40"
                : "text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70"
            }`}
          >
            {designer.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
        <svg className="w-4 h-4 text-[#C4B99A] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
