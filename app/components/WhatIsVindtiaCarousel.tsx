"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const images = [
  "/vindtia-second-image.jpg",
  "/image-2.jpg",
  "/image-3.jpg",
];

// Different zoom origins for Ken Burns variety
const zoomOrigins = [
  "center center",
  "top center",
  "center right",
];

// Object position for each image (to control cropping)
const objectPositions = [
  "top center", // First image - show top of head
  "center center",
  "center center",
];

export default function WhatIsVindtiaCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect when component is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setHasAnimated(true), 100);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only start carousel when visible
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-1000 ${
        hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Outer glow effect */}
      <div
        className="absolute -inset-6 pointer-events-none opacity-50"
        style={{
          background: "radial-gradient(ellipse at center, rgba(196,185,154,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Main image container */}
      <div className="aspect-[4/5] relative rounded-sm overflow-hidden">
        {/* Images with Ken Burns effect */}
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt="Vintage couture fashion"
              fill
              className={`object-cover transition-transform duration-[6000ms] ease-out ${
                index === currentIndex ? "scale-110" : "scale-100"
              }`}
              style={{
                transformOrigin: zoomOrigins[index],
                objectPosition: objectPositions[index],
              }}
              priority={index === 0}
            />
          </div>
        ))}

        {/* Film grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        {/* Warm light overlay */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-20"
          style={{
            background: "linear-gradient(135deg, rgba(196,185,154,0.3) 0%, transparent 50%, rgba(139,41,66,0.2) 100%)",
          }}
        />
      </div>

      {/* Elegant corner accents */}
      <div className="absolute -top-3 -left-3 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--gold)] to-transparent opacity-40" />
        <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[var(--gold)] to-transparent opacity-40" />
      </div>
      <div className="absolute -top-3 -right-3 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[var(--gold)] to-transparent opacity-40" />
        <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-[var(--gold)] to-transparent opacity-40" />
      </div>
      <div className="absolute -bottom-3 -left-3 w-8 h-8 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--gold)] to-transparent opacity-40" />
        <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-[var(--gold)] to-transparent opacity-40" />
      </div>
      <div className="absolute -bottom-3 -right-3 w-8 h-8 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[var(--gold)] to-transparent opacity-40" />
        <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-[var(--gold)] to-transparent opacity-40" />
      </div>

      {/* Carousel indicators */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 ${
              index === currentIndex
                ? "w-6 h-[2px] bg-[var(--gold)]"
                : "w-2 h-[2px] bg-[var(--gold)]/30 hover:bg-[var(--gold)]/50"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
