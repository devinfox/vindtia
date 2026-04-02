"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

// Animated Section with scroll-triggered reveal
export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-down" | "fade-scale" | "slide-left" | "slide-right" | "reveal";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0";
    switch (animation) {
      case "fade-up":
        return "animate-fade-in-up";
      case "fade-down":
        return "animate-fade-in-down";
      case "fade-scale":
        return "animate-fade-in-scale";
      case "slide-left":
        return "animate-slide-in-left";
      case "slide-right":
        return "animate-slide-in-right";
      case "reveal":
        return "animate-reveal-up";
      default:
        return "animate-fade-in-up";
    }
  };

  return (
    <div ref={ref} className={`${className} ${getAnimationClass()}`}>
      {children}
    </div>
  );
}

// Animated product grid with staggered reveal
export function AnimatedProductGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${isVisible ? "grid-stagger" : ""}`}>
      {children}
    </div>
  );
}

// Luxury divider with animation
export function LuxuryDivider({
  color = "currentColor",
  className = "",
  variant = "default",
}: {
  color?: string;
  className?: string;
  variant?: "default" | "dots" | "flourish" | "minimal";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (variant === "flourish") {
    return (
      <div ref={ref} className={`flex items-center justify-center gap-4 ${className}`}>
        <div
          className={`h-[1px] transition-all duration-1000 ease-out ${
            isVisible ? "w-16 opacity-40" : "w-0 opacity-0"
          }`}
          style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
        />
        <div
          className={`w-1.5 h-1.5 rounded-full transition-all duration-700 delay-300 ${
            isVisible ? "opacity-50 scale-100" : "opacity-0 scale-0"
          }`}
          style={{ backgroundColor: color }}
        />
        <div
          className={`h-[1px] transition-all duration-1000 ease-out ${
            isVisible ? "w-16 opacity-40" : "w-0 opacity-0"
          }`}
          style={{ background: `linear-gradient(270deg, transparent, ${color})` }}
        />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div ref={ref} className={`flex items-center justify-center gap-3 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-all duration-500 ${
              isVisible ? "opacity-40 scale-100" : "opacity-0 scale-0"
            }`}
            style={{
              backgroundColor: color,
              transitionDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div ref={ref} className={`flex justify-center ${className}`}>
        <div
          className={`h-[1px] transition-all duration-1000 ease-out ${
            isVisible ? "w-12 opacity-30" : "w-0 opacity-0"
          }`}
          style={{ backgroundColor: color }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex justify-center ${className}`}>
      <div
        className={`h-[1px] transition-all duration-1200 ease-out ${
          isVisible ? "w-24 opacity-30" : "w-0 opacity-0"
        }`}
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </div>
  );
}

// Animated scroll indicator
export function AnimatedScrollIndicator({
  color = "#FFFFFF",
}: {
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-[10px] tracking-[0.4em] uppercase animate-fade-in-down"
        style={{ color, opacity: 0.5 }}
      >
        Scroll to Explore
      </span>
      <div className="relative animate-scroll-bounce">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke={color}
          strokeWidth={1}
          viewBox="0 0 24 24"
          style={{ opacity: 0.5 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}

// Animated corner ornaments
export function AnimatedCorners({
  color = "#C6A75E",
  size = "md",
}: {
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16 lg:w-24 lg:h-24",
    lg: "w-24 h-24 lg:w-32 lg:h-32",
  };

  const positionClasses = {
    sm: "top-4 left-4",
    md: "top-6 left-6 lg:top-10 lg:left-10",
    lg: "top-8 left-8 lg:top-12 lg:left-12",
  };

  return (
    <>
      {/* Top Left */}
      <div className={`absolute ${positionClasses[size]} ${sizeClasses[size]} pointer-events-none corner-ornament`}>
        <div
          className="absolute top-0 left-0 w-full h-[1px]"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        />
        <div
          className="absolute top-0 left-0 h-full w-[1px]"
          style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
        />
        <div
          className="absolute top-0 left-0 w-2 h-2"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          }}
        />
      </div>
      {/* Top Right */}
      <div className={`absolute ${positionClasses[size].replace("left", "right")} ${sizeClasses[size]} pointer-events-none corner-ornament`} style={{ animationDelay: "0.5s" }}>
        <div
          className="absolute top-0 right-0 w-full h-[1px]"
          style={{ background: `linear-gradient(270deg, ${color}, transparent)` }}
        />
        <div
          className="absolute top-0 right-0 h-full w-[1px]"
          style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
        />
      </div>
      {/* Bottom Left */}
      <div className={`absolute ${positionClasses[size].replace("top", "bottom")} ${sizeClasses[size]} pointer-events-none corner-ornament`} style={{ animationDelay: "1s" }}>
        <div
          className="absolute bottom-0 left-0 w-full h-[1px]"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        />
        <div
          className="absolute bottom-0 left-0 h-full w-[1px]"
          style={{ background: `linear-gradient(0deg, ${color}, transparent)` }}
        />
      </div>
      {/* Bottom Right */}
      <div className={`absolute ${positionClasses[size].replace("top", "bottom").replace("left", "right")} ${sizeClasses[size]} pointer-events-none corner-ornament`} style={{ animationDelay: "1.5s" }}>
        <div
          className="absolute bottom-0 right-0 w-full h-[1px]"
          style={{ background: `linear-gradient(270deg, ${color}, transparent)` }}
        />
        <div
          className="absolute bottom-0 right-0 h-full w-[1px]"
          style={{ background: `linear-gradient(0deg, ${color}, transparent)` }}
        />
      </div>
    </>
  );
}

// Animated iconic codes strip
export function IconicCodesStrip({
  codes,
  textColor,
  accentColor,
  bgColor,
  borderColor,
  isItalic = false,
}: {
  codes: string[];
  textColor: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  isItalic?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      className="py-8 md:py-12 border-y relative overflow-hidden"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      {/* Subtle animated gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}10, transparent)`,
          animation: "shimmer 8s ease-in-out infinite",
          backgroundSize: "200% 100%",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Mobile: 2-column grid, Desktop: horizontal flex */}
        <div className={`
          grid grid-cols-2 gap-4 text-center
          md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-12 lg:gap-x-16 md:gap-y-4
          text-xs md:text-sm tracking-[0.15em] md:tracking-[0.2em] uppercase
          ${isItalic ? "font-editorial italic" : "font-light"}
        `}>
          {codes.map((code, i) => (
            <span
              key={code}
              className="relative cursor-default transition-all duration-500 py-2 md:py-0"
              style={{
                color: hoveredIndex === i ? accentColor : textColor,
                transform: hoveredIndex === i ? "scale(1.05)" : "scale(1)",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {code}
              {/* Animated underline */}
              <span
                className="absolute -bottom-0 md:-bottom-1 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 h-[1px] transition-all duration-500"
                style={{
                  width: hoveredIndex === i ? "80%" : "0%",
                  backgroundColor: accentColor,
                  opacity: 0.5,
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured quote section
export function BrandQuote({
  quote,
  author,
  colors,
  isVersace = false,
  isArmani = false,
  isValentino = false,
  isPrada = false,
}: {
  quote: string;
  author: string;
  colors: {
    text: string;
    accent: string;
    background: string;
  };
  isVersace?: boolean;
  isArmani?: boolean;
  isValentino?: boolean;
  isPrada?: boolean;
}) {
  return (
    <AnimatedSection animation="fade-scale" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Opening quote mark */}
        <div
          className="text-8xl lg:text-9xl font-editorial leading-none mb-6 opacity-20"
          style={{ color: colors.accent }}
        >
          "
        </div>

        <p
          className={`text-xl lg:text-2xl xl:text-3xl leading-relaxed mb-8 ${
            isArmani ? "font-light tracking-wide" : isValentino ? "font-editorial italic" : "font-editorial"
          }`}
          style={{ color: colors.text, opacity: 0.9 }}
        >
          {quote}
        </p>

        <LuxuryDivider
          color={colors.accent}
          variant={isValentino ? "flourish" : isArmani ? "minimal" : "dots"}
          className="mb-6"
        />

        <p
          className={`text-sm tracking-[0.3em] uppercase ${isArmani ? "font-light" : ""}`}
          style={{ color: colors.accent, opacity: 0.7 }}
        >
          — {author}
        </p>
      </div>
    </AnimatedSection>
  );
}

// Enhanced product card
export function LuxuryProductCard({
  product,
  brandVariant,
  colors,
}: {
  product: {
    id: string;
    name: string;
    era?: string;
    product_media?: { url: string }[];
  };
  brandVariant: "versace" | "armani" | "valentino" | "prada" | "default";
  colors: {
    text: string;
    secondary: string;
    primary: string;
    cardBg: string;
  };
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getCardClass = () => {
    switch (brandVariant) {
      case "versace":
        return "product-card-luxury product-card-versace";
      case "armani":
        return "product-card-luxury product-card-armani";
      case "valentino":
        return "product-card-luxury product-card-valentino";
      case "prada":
        return "product-card-luxury product-card-prada";
      default:
        return "product-card-luxury";
    }
  };

  return (
    <a
      href={`/storefront/product/${product.id}`}
      className={`group block ${getCardClass()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative aspect-[3/4] mb-5 overflow-hidden image-zoom-container"
        style={{ backgroundColor: colors.cardBg }}
      >
        {product.product_media?.[0]?.url ? (
          <>
            <img
              src={product.product_media[0].url}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                brandVariant === "armani" ? "grayscale-[20%] group-hover:grayscale-0" : ""
              }`}
            />
            {/* Hover overlay with gradient */}
            <div
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
              style={{
                opacity: isHovered ? 1 : 0,
                background:
                  brandVariant === "versace"
                    ? "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)"
                    : brandVariant === "valentino"
                    ? "linear-gradient(to top, rgba(190,10,38,0.1) 0%, transparent 50%)"
                    : brandVariant === "armani"
                    ? "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
              }}
            />
            {/* Quick view indicator */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateY(0) translateX(-50%)" : "translateY(10px) translateX(-50%)",
              }}
            >
              <span
                className="text-[10px] tracking-[0.3em] uppercase px-4 py-2"
                style={{
                  color: brandVariant === "valentino" ? colors.text : "#fff",
                  backgroundColor:
                    brandVariant === "versace"
                      ? "rgba(198, 167, 94, 0.9)"
                      : brandVariant === "valentino"
                      ? "rgba(255, 255, 255, 0.95)"
                      : "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(10px)",
                }}
              >
                View Details
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: colors.primary, opacity: 0.3 }}
            >
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-1">
        <h3
          className={`text-lg transition-colors duration-500 ${
            brandVariant === "armani" ? "font-light tracking-wide" : "font-editorial"
          }`}
          style={{ color: isHovered ? colors.primary : colors.text }}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p
            className={`text-sm ${
              brandVariant === "valentino" ? "font-editorial italic" : brandVariant === "armani" ? "font-light" : ""
            }`}
            style={{ color: colors.secondary, opacity: 0.7 }}
          >
            {product.era || "Vintage"}
          </p>
          {/* Animated arrow on hover */}
          <svg
            className="w-4 h-4 transition-all duration-500"
            style={{
              color: colors.primary,
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateX(0)" : "translateX(-10px)",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </a>
  );
}

// Parallax background effect
export function ParallaxBackground({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollY(scrollProgress * 50); // Max 50px parallax
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{ transform: `translateY(${scrollY}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
