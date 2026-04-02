import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Cinzel } from "next/font/google";
import Navbar from "@/components/Navbar";
import DesignerModal from "@/components/DesignerModal";
import ScrollToTop from "@/components/ScrollToTop";
import {
  AnimatedSection,
  AnimatedProductGrid,
  LuxuryDivider,
  AnimatedScrollIndicator,
  AnimatedCorners,
  IconicCodesStrip,
  LuxuryProductCard,
} from "@/components/BrandPageAnimations";

// Cinzel for Versace-style Roman serif headings
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

// Brand data with official colors, history, and patterns
const brandData: Record<string, {
  name: string;
  founded: string;
  founder: string;
  origin: string;
  headquarters: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    goldDark?: string;
    goldLight?: string;
    emerald?: string;
    ruby?: string;
  };
  history: string[];
  signature: string;
  pattern: string;
  quote: string;
  quoteAuthor: string;
  iconicCodes: string[];
}> = {
  versace: {
    name: "Versace",
    founded: "1978",
    founder: "Gianni Versace",
    origin: "Milan, Italy",
    headquarters: "Milan, Italy",
    colors: {
      primary: "#C6A75E", // Versace Gold (Primary)
      secondary: "#000000", // Versace Black
      accent: "#1A1A1A", // Rich Charcoal
      background: "#000000",
      text: "#FFFFFF",
      goldDark: "#A8893C", // Deep Antique Gold
      goldLight: "#E5C97A", // Light Gold Highlight
      emerald: "#0F5C4C",
      ruby: "#7A0F1B",
    },
    history: [
      "Founded in 1978 by Gianni Versace, the house quickly became synonymous with Italian luxury and bold, sensual designs that celebrated the human form.",
      "Gianni's revolutionary approach merged art, fashion, and celebrity culture, dressing supermodels and creating the concept of the 'supermodel' alongside photographers like Richard Avedon.",
      "The iconic Medusa head logo, inspired by Greek mythology, represents the brand's power to mesmerize and captivate — a reflection of Versace's bold aesthetic.",
      "After Gianni's tragic passing in 1997, his sister Donatella took the helm as Creative Director, continuing the legacy of daring glamour and innovative design.",
      "Today, Versace remains a symbol of maximalist luxury, known for its baroque prints, gold hardware, and unapologetic celebration of excess and beauty.",
    ],
    signature: "Baroque prints, Medusa motif, Greek key patterns, and bold use of gold",
    // Greek key / Meander pattern SVG with correct Versace gold
    pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10zm10-10h10v10H20V0zm10 10h10v10H30V10zM0 20h10v10H0V20zm20 0h10v10H20V20zM10 30h10v10H10V30zm20 0h10v10H30V30z' fill='%23C6A75E' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    quote: "Don't be into trends. Don't make fashion own you, but you decide what you are, what you want to express by the way you dress and the way you live.",
    quoteAuthor: "Gianni Versace",
    iconicCodes: ["Medusa Motif", "Greek Key", "Baroque Prints", "Bold Gold"],
  },
  "giorgio-armani": {
    name: "Giorgio Armani",
    founded: "1975",
    founder: "Giorgio Armani",
    origin: "Milan, Italy",
    headquarters: "Milan, Italy",
    colors: {
      primary: "#2D2D2D", // Charcoal
      secondary: "#9E958A", // Warm Greige
      accent: "#64748B", // Slate Blue
      background: "#2D2D2D", // Charcoal base
      text: "#F5F5F0", // Soft Ivory
    },
    history: [
      "In 1975, Giorgio Armani founded his eponymous label, forever changing the language of modern fashion. His revolutionary approach to tailoring—deconstructed, unstructured, and impossibly fluid—liberated both men and women from the rigid constraints of traditional suiting.",
      "Armani's genius lay in understanding that true luxury whispers rather than shouts. His neutral palette of greiges, charcoals, and soft ivories became a uniform for a new kind of power—one defined by confidence, not ostentation.",
      "The 1980s saw Armani dress Hollywood's elite, with Richard Gere's wardrobe in American Gigolo single-handedly redefining masculine elegance. The 'Armani suit' became synonymous with understated authority.",
      "His approach to womenswear was equally transformative, offering powerful silhouettes that moved with the body rather than constraining it. The Armani woman was strong, sensual, and effortlessly sophisticated.",
      "Today, the house remains the definitive voice of quiet Italian luxury—where every seam, every drape, every shade of grey speaks to the philosophy that elegance is elimination.",
    ],
    signature: "The art of restraint. Fluid tailoring, neutral palettes, and silhouettes that defined modern elegance.",
    // Subtle linen/wool weave texture pattern
    pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23F5F5F0' stroke-opacity='0.03' stroke-width='0.5'/%3E%3C/svg%3E")`,
    quote: "Elegance is not standing out, but being remembered. I believe in style, not fashion.",
    quoteAuthor: "Giorgio Armani",
    iconicCodes: ["Soft Tailoring", "Neutral Palette", "Fluid Eveningwear", "Power Suits"],
  },
  valentino: {
    name: "Valentino",
    founded: "1960",
    founder: "Valentino Garavani",
    origin: "Rome, Italy",
    headquarters: "Rome, Italy",
    colors: {
      primary: "#BE0A26", // Valentino Red (used sparingly)
      secondary: "#6B5B5B", // Warm taupe for secondary text
      accent: "#FDF5F3", // Soft Blush
      background: "#FFFAF5", // Warm Ivory
      text: "#2D2424", // Deep warm brown
    },
    history: [
      "In 1960, a young Valentino Garavani opened his atelier on Via Condotti in Rome, beginning what would become one of fashion's most enduring love affairs with beauty, femininity, and the transformative power of couture.",
      "His vision was singular: to dress women in dreams. The flowing chiffons, the weightless silks, the impossibly romantic silhouettes—each creation was a poem written in fabric, celebrating the grace of the feminine form.",
      "The iconic Valentino Red emerged from a revelation at the Barcelona Opera, where the designer was captivated by the passion and intensity of red gowns against velvet seats. This singular shade would become his signature, worn by icons from Jacqueline Kennedy to modern royalty.",
      "For over four decades, Valentino dressed the world's most elegant women, from Hollywood stars to European aristocracy. His couture gowns became synonymous with life's most precious moments—weddings, galas, and occasions demanding nothing less than absolute beauty.",
      "Today, the house continues to embody the poetry of Italian couture—where every stitch carries the legacy of romance, every drape whispers of Roman elegance, and every creation honors the eternal pursuit of feminine beauty.",
    ],
    signature: "The poetry of couture — fluid silhouettes, iconic red, and timeless femininity from the heart of Rome.",
    // Subtle silk/marble texture pattern
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 45 50 50 T100 50' stroke='%23BE0A26' stroke-opacity='0.02' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
    quote: "I love beauty. It's not my fault. I want women to be ladies and to be very glamorous in the spirit of old Hollywood — like Grace Kelly.",
    quoteAuthor: "Valentino Garavani",
    iconicCodes: ["Valentino Red", "Couture Draping", "Roman Heritage", "Modern Romance"],
  },
  prada: {
    name: "Prada",
    founded: "1913",
    founder: "Mario Prada",
    origin: "Milan, Italy",
    headquarters: "Milan, Italy",
    colors: {
      primary: "#1a1a1a",
      secondary: "#E8E0D0",
      accent: "#2a2a2a",
      background: "#1a1a1a",
      text: "#E8E0D0",
    },
    history: [
      "In 1913, Mario Prada opened a leather goods shop in Milan's prestigious Galleria Vittorio Emanuele II. What began as a purveyor of fine luggage would become one of fashion's most intellectually rigorous houses.",
      "The transformation came in 1978 when Mario's granddaughter, Miuccia Prada, took the helm. Armed with a doctorate in political science and a deep understanding of contemporary culture, she would redefine luxury for the modern age.",
      "Her 1984 introduction of the black nylon backpack was a manifesto in miniature—challenging conventions of luxury, embracing the industrial, and proving that innovation could coexist with heritage.",
      "Under Miuccia's vision, Prada became fashion's thinking person's brand. Collections explored themes of femininity, power, and the tensions of contemporary life with an intellectual depth unprecedented in the industry.",
      "Today, Prada continues to challenge and provoke, proving that fashion at its highest form is not merely aesthetic but philosophical—a continuous dialogue between past and future, tradition and subversion.",
    ],
    signature: "Intellect. Precision. Subversion.",
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23E8E0D0' stroke-opacity='0.02' stroke-width='1'/%3E%3C/svg%3E")`,
    quote: "What you wear is how you present yourself to the world, especially today when human contacts are so quick. Fashion is instant language.",
    quoteAuthor: "Miuccia Prada",
    iconicCodes: ["Nylon Innovation", "Intellectual Fashion", "Minimal Geometry", "Quiet Subversion"],
  },
};

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = brandData[slug];

  if (!brand) {
    notFound();
  }

  // Fetch designer and their products from database
  let products: any[] = [];
  let dbDesigner: any = null;
  try {
    const supabase = await createClient();

    // First, look up the designer by slug to get their UUID
    const { data: designerData } = await supabase
      .from("designers")
      .select("id, name, bio, slug, founded, origin, headquarters, signature")
      .eq("slug", slug)
      .single();

    if (designerData) {
      dbDesigner = designerData;

      // Fetch products for this designer using their UUID
      const { data: productsData } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price_per_rental,
          era,
          product_media (
            url
          )
        `)
        .eq("designer_id", designerData.id)
        .eq("archive", false)
        .limit(8);

      if (productsData) products = productsData;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  const isVersace = slug === "versace";
  const isArmani = slug === "giorgio-armani";
  const isValentino = slug === "valentino";
  const isPrada = slug === "prada";

  return (
    <div
      className={`min-h-screen ${isVersace ? cinzel.variable : ""}`}
      style={{
        backgroundColor: brand.colors.background,
        color: brand.colors.text,
      }}
    >
      {/* Scroll to top on page load */}
      <ScrollToTop />

      {/* Sticky Navbar */}
      <Navbar transparent={true} sticky={true} />

      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: brand.pattern }}
      />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: isArmani ? '#2D2D2D' : isValentino ? '#FFFAF5' : isPrada ? '#1a1a1a' : brand.colors.background,
        }}
      >
        {/* Background Image for Versace */}
        {isVersace && (
          <Image
            src="/versace-banner.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
        )}

        {/* Background Image for Armani */}
        {isArmani && (
          <>
            <Image
              src="/armani-banner-image.png"
              alt=""
              fill
              priority
              className="object-cover"
            />
            {/* Dark moody gradient overlay - darker on left */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(20,18,16,0.85) 0%, rgba(30,28,26,0.6) 40%, rgba(40,38,36,0.4) 70%, rgba(50,48,46,0.3) 100%)',
              }}
            />
            {/* Additional vignette for depth */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 70% 50%, transparent 30%, rgba(15,13,11,0.5) 100%)',
              }}
            />
          </>
        )}

        {/* Background Image for Valentino */}
        {isValentino && (
          <>
            <Image
              src="/valentino-banner-image.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />
            {/* Subtle dark overlay on left for text readability */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)',
              }}
            />
            {/* Warm film grain effect */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
          </>
        )}

        {/* Background Image for Prada */}
        {isPrada && (
          <>
            {/* Mobile banner */}
            <Image
              src="/prada-mobile-banner.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center md:hidden"
            />
            {/* Desktop banner */}
            <Image
              src="/prada-banner.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center hidden md:block"
            />
            {/* Gradient overlay for text readability - stronger on mobile */}
            <div
              className="absolute inset-0 md:hidden"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.7) 100%)',
              }}
            />
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.4) 100%)',
              }}
            />
            {/* Soft vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </>
        )}

        {/* Dark overlay - skip for Armani, Valentino, Prada (have custom overlays) */}
        {!isArmani && !isValentino && !isPrada && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isVersace
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
                : `linear-gradient(135deg, ${brand.colors.background} 0%, ${brand.colors.accent} 100%)`
            }}
          />
        )}

        {/* Vignette - skip for Armani, Valentino, Prada (have custom vignette) */}
        {!isArmani && !isValentino && !isPrada && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)'
            }}
          />
        )}

        {/* Valentino vignette */}
        {isValentino && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
            }}
          />
        )}

        {/* Decorative corner borders - Versace gold */}
        {isVersace && <AnimatedCorners color="#C6A75E" size="md" />}

        {/* Armani - Minimal architectural lines */}
        {isArmani && (
          <>
            {/* Thin horizontal rule at top */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-[#F5F5F0]/20" />
            {/* Thin horizontal rule at bottom */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-[#F5F5F0]/20" />
          </>
        )}

        {/* Valentino - Romantic soft decorative elements */}
        {isValentino && (
          <>
            {/* Delicate top flourish */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-40">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#F5F0E8]/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5F0E8]/50" />
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#F5F0E8]/60" />
            </div>
          </>
        )}

        {/* Prada - Geometric decorative elements */}
        {isPrada && (
          <>
            {/* Minimal geometric accent */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-30">
              <div className="w-2 h-2 border border-[#E8E0D0]/40 rotate-45" />
            </div>
          </>
        )}

        {/* Floating decorative elements - hidden on mobile */}
        {isVersace && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
            {/* Floating Greek key pattern accent */}
            <div className="absolute top-1/4 right-10 w-32 h-32 opacity-10 animate-float" style={{ animationDelay: '0s' }}>
              <svg viewBox="0 0 100 100" fill="none" stroke="#C6A75E" strokeWidth="0.5">
                <path d="M10 10 H90 V30 H30 V50 H70 V70 H10 V90 H90" />
              </svg>
            </div>
            <div className="absolute bottom-1/4 left-10 w-24 h-24 opacity-5 animate-float" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 100 100" fill="none" stroke="#C6A75E" strokeWidth="0.5">
                <circle cx="50" cy="50" r="40" />
                <circle cx="50" cy="50" r="30" />
              </svg>
            </div>
          </div>
        )}

        <div className="relative z-10 text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
          {/* Shop by Designer - thin sans serif */}
          {(isVersace || isArmani || isValentino || isPrada) && (
            <p
              className={`font-sans text-xs lg:text-sm tracking-[0.4em] uppercase ${isPrada ? 'mb-5' : 'mb-6'} animate-fade-in-down`}
              style={{
                color: isArmani
                  ? 'rgba(158,149,138,0.8)'
                  : isValentino
                  ? 'rgba(255,255,255,0.8)'
                  : isPrada
                  ? 'rgba(232,224,208,0.7)'
                  : 'rgba(255,255,255,0.8)',
                animationDelay: '0.2s',
                animationFillMode: 'both',
              }}
            >
              Shop by Designer
            </p>
          )}

          {/* Brand Name */}
          {isPrada ? (
            <div className="mb-4 animate-fade-in-scale w-[240px] sm:w-[320px] md:w-[400px] mx-auto" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <Image
                src="/Prada-Logo.png"
                alt="Prada"
                width={400}
                height={100}
                className="w-full h-auto brightness-110"
                style={{ filter: 'drop-shadow(0 2px 15px rgba(0,0,0,0.5))' }}
              />
            </div>
          ) : isVersace ? (
            <div className="mb-4 animate-fade-in-scale w-[240px] sm:w-[320px] md:w-[400px] mx-auto" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <Image
                src="/versace-logo.png"
                alt="Versace"
                width={400}
                height={100}
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 2px 15px rgba(0,0,0,0.5))' }}
              />
            </div>
          ) : isArmani ? (
            <div className="mb-4 animate-fade-in-scale w-[280px] sm:w-[400px] md:w-[550px] mx-auto" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <Image
                src="/armani-logo.png"
                alt="Giorgio Armani"
                width={550}
                height={120}
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 2px 15px rgba(0,0,0,0.5))' }}
              />
            </div>
          ) : isValentino ? (
            <div className="mb-4 animate-fade-in-scale w-[280px] sm:w-[400px] md:w-[550px] mx-auto" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <Image
                src="/valentino-logo.png"
                alt="Valentino"
                width={550}
                height={120}
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.4))' }}
              />
            </div>
          ) : (
            <h1
              className="mb-4 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display tracking-wider animate-fade-in-scale"
              style={{ color: brand.colors.text, animationDelay: '0.4s', animationFillMode: 'both' }}
            >
              {brand.name.toUpperCase()}
            </h1>
          )}

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl lg:text-2xl ${isPrada ? 'mb-3' : 'mb-6'} ${
              isVersace ? "font-editorial italic"
              : isArmani ? "font-editorial italic font-light"
              : isValentino ? "font-editorial italic"
              : isPrada ? "font-editorial italic"
              : ""
            } animate-fade-in-up`}
            style={{
              color: isVersace ? '#FFFFFF' : isArmani ? '#F5F5F0' : isValentino ? '#FFFFFF' : isPrada ? '#E8E0D0' : brand.colors.secondary,
              letterSpacing: isArmani ? '0.05em' : isValentino ? '0.02em' : isPrada ? '0.03em' : undefined,
              textShadow: isValentino ? '0 1px 10px rgba(0,0,0,0.4)' : isPrada ? '0 1px 10px rgba(0,0,0,0.5)' : undefined,
              animationDelay: '0.6s',
              animationFillMode: 'both',
            }}
          >
            {isVersace ? "House of Medusa" : isArmani ? "Quiet Power. Timeless Form." : isValentino ? "Romance. Grace. Legacy." : isPrada ? "Intellect. Precision. Subversion." : `Est. ${brand.founded}`}
          </p>

          {/* Decorative line */}
          <div
            className="mx-auto h-[1px] w-0 animate-line-expand mb-6"
            style={{
              background: isVersace ? 'linear-gradient(90deg, transparent, #C6A75E, transparent)'
                : isArmani ? 'linear-gradient(90deg, transparent, rgba(245,245,240,0.3), transparent)'
                : isValentino ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                : isPrada ? 'linear-gradient(90deg, transparent, rgba(232,224,208,0.4), transparent)'
                : `linear-gradient(90deg, transparent, ${brand.colors.secondary}, transparent)`,
              maxWidth: '120px',
              animationDelay: '0.8s',
              animationFillMode: 'both',
            }}
          />

          {/* Tagline */}
          <p
            className={`text-sm lg:text-base tracking-[0.2em] uppercase ${isPrada ? 'mb-3' : 'mb-6'} animate-fade-in-up`}
            style={{
              color: isVersace ? 'rgba(255,255,255,0.7)'
                : isArmani ? 'rgba(158,149,138,0.7)'
                : isValentino ? 'rgba(255,255,255,0.7)'
                : isPrada ? 'rgba(232,224,208,0.7)'
                : brand.colors.secondary,
              textShadow: isValentino ? '0 1px 6px rgba(0,0,0,0.3)' : isPrada ? '0 1px 6px rgba(0,0,0,0.4)' : undefined,
              animationDelay: '0.9s',
              animationFillMode: 'both',
            }}
          >
            Est. {brand.founded} · {brand.origin}
          </p>

          {/* Signature */}
          <p
            className={`font-editorial text-base lg:text-lg max-w-xl mx-auto ${isPrada ? 'mb-6' : 'mb-10'} leading-relaxed ${
              isArmani ? 'font-light' : isValentino ? 'italic' : isPrada ? '' : ''
            } animate-fade-in-up`}
            style={{
              color: isVersace ? 'rgba(255,255,255,0.85)'
                : isArmani ? 'rgba(245,245,240,0.75)'
                : isValentino ? 'rgba(255,255,255,0.9)'
                : isPrada ? 'rgba(232,224,208,0.85)'
                : brand.colors.secondary,
              opacity: isArmani ? 1 : isValentino ? 1 : isPrada ? 1 : 0.85,
              textShadow: isValentino ? '0 1px 8px rgba(0,0,0,0.35)' : isPrada ? '0 1px 8px rgba(0,0,0,0.4)' : undefined,
              animationDelay: '1s',
              animationFillMode: 'both',
            }}
          >
            {isPrada ? "A study in modern femininity — minimal forms, unexpected materials, and quiet disruption from Milan's most cerebral house." : brand.signature}
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
            <DesignerModal
              brandName={brand.name}
              founder={brand.founder}
              headquarters={brand.headquarters}
              history={brand.history}
              colors={{
                primary: brand.colors.primary,
                text: brand.colors.text,
                background: brand.colors.background,
              }}
              isVersace={isVersace}
              isArmani={isArmani}
              isValentino={isValentino}
              isPrada={isPrada}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <AnimatedScrollIndicator
            color={isVersace ? '#FFFFFF' : isArmani ? '#9E958A' : isValentino ? '#FFFFFF' : isPrada ? '#E8E0D0' : brand.colors.text}
          />
        </div>
      </section>

      {/* Iconic Codes Strip - Versace */}
      {isVersace && (
        <IconicCodesStrip
          codes={brand.iconicCodes}
          textColor="#C6A75E"
          accentColor="#E5C97A"
          bgColor="#0A0A0A"
          borderColor="rgba(198, 167, 94, 0.2)"
        />
      )}

      {/* Iconic Codes Strip - Armani */}
      {isArmani && (
        <IconicCodesStrip
          codes={brand.iconicCodes}
          textColor="#9E958A"
          accentColor="#F5F5F0"
          bgColor="#252525"
          borderColor="rgba(245, 245, 240, 0.1)"
        />
      )}

      {/* Iconic Codes Strip - Valentino */}
      {isValentino && (
        <IconicCodesStrip
          codes={brand.iconicCodes}
          textColor="#6B5B5B"
          accentColor="#BE0A26"
          bgColor="#FDF5F3"
          borderColor="rgba(190, 10, 38, 0.1)"
          isItalic
        />
      )}

      {/* Iconic Codes Strip - Prada */}
      {isPrada && (
        <IconicCodesStrip
          codes={brand.iconicCodes}
          textColor="#4A4A4A"
          accentColor="#1a1a1a"
          bgColor="#F5F5F5"
          borderColor="rgba(26, 26, 26, 0.1)"
        />
      )}

      {/* Archive Section */}
      <section
        className="relative py-16 sm:py-24 lg:py-32"
        style={{
          backgroundColor: isVersace ? '#141210' : isArmani ? '#3A3A3A' : isValentino ? '#FFFAF5' : isPrada ? '#1a1a1a' : '#F5F5F5',
        }}
      >
        {/* Brand-specific wallpaper background */}
        {isVersace && (
          <Image
            src="/brands-wallpaper/versace-textured-wallpaper.jpg"
            alt=""
            fill
            className="object-cover"
          />
        )}
        {isArmani && (
          <Image
            src="/brands-wallpaper/armani-textured-wallpaper.jpg"
            alt=""
            fill
            className="object-cover"
          />
        )}
        {isValentino && (
          <Image
            src="/brands-wallpaper/valentino-wallpaper-texture.jpg"
            alt=""
            fill
            className="object-cover"
          />
        )}
        {isPrada && (
          <Image
            src="/brands-wallpaper/prada-textured-wallpaper.jpg"
            alt=""
            fill
            className="object-cover"
          />
        )}

        {/* Armani: Subtle top border */}
        {isArmani && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-[#F5F5F0]/10 z-10" />
        )}

        {/* Valentino: Delicate flourish border */}
        {isValentino && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-3 -translate-y-1/2 z-10">
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-[#BE0A26]/20" />
            <div className="w-1 h-1 rounded-full bg-[#BE0A26]/30" />
            <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-[#BE0A26]/20" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <AnimatedSection animation="fade-up" className="flex items-center justify-between mb-16">
            <div>
              {/* Section label */}
              <p
                className={`text-[10px] tracking-[0.4em] uppercase mb-4 ${isArmani ? 'font-light' : ''}`}
                style={{
                  color: isVersace ? '#C6A75E' : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.primary,
                  opacity: 0.6,
                }}
              >
                {isVersace ? 'Curated Selection' : isArmani ? 'From the Archives' : isValentino ? 'Maison Heritage' : isPrada ? 'The Collection' : 'Featured Pieces'}
              </p>
              <h2
                className={`text-2xl sm:text-3xl lg:text-4xl ${
                  isVersace
                    ? "tracking-[0.15em] uppercase"
                    : isArmani
                    ? "tracking-[0.1em] uppercase font-light"
                    : isValentino
                    ? "font-display tracking-wide italic"
                    : isPrada
                    ? "tracking-[0.1em] uppercase font-light"
                    : "font-display tracking-wide"
                }`}
                style={isVersace ? {
                  fontFamily: "var(--font-cinzel), Cinzel, serif",
                  fontWeight: 500,
                  color: brand.colors.primary,
                } : isArmani ? {
                  fontFamily: "var(--font-cormorant), Garamond, serif",
                  fontWeight: 300,
                  color: '#F5F5F0',
                } : isValentino ? {
                  fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                  color: '#2D2424',
                } : isPrada ? {
                  color: '#2D2D2D',
                } : { color: brand.colors.text }}
              >
                {isArmani ? 'The Archive' : isValentino ? 'The Collection' : isPrada ? 'Archive Pieces' : `${brand.name} Archive`}
              </h2>
              <p
                className={`mt-3 text-sm max-w-md ${isArmani ? 'font-light' : isValentino ? 'font-editorial italic' : ''}`}
                style={{
                  color: isVersace ? '#E8E0D0' : isArmani ? '#9E958A' : isValentino ? '#6B5B5B' : isPrada ? '#5A5A5A' : brand.colors.text,
                  opacity: isArmani ? 0.7 : isValentino ? 0.8 : isPrada ? 0.8 : 0.6,
                }}
              >
                {isArmani
                  ? 'Authenticated pieces from the Giorgio Armani archives'
                  : isValentino
                  ? 'Curated couture pieces from the house of Valentino'
                  : isPrada
                  ? 'Authenticated vintage pieces from the Prada archives'
                  : `Explore authenticated vintage pieces from the ${brand.name} archives`}
              </p>
            </div>
            <Link
              href="/storefront"
              className={`hidden sm:inline-flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] uppercase border transition-all duration-700 group ${
                isArmani ? 'hover:bg-[#F5F5F0]/5' : isValentino ? 'hover:bg-[#BE0A26]/5 hover:border-[#BE0A26]/40' : isPrada ? 'hover:bg-[#2D2D2D]/5 hover:border-[#2D2D2D]/40' : isVersace ? 'hover:bg-[#C6A75E]/10' : ''
              }`}
              style={{
                borderColor: isVersace ? `${brand.colors.primary}50` : isArmani ? 'rgba(245,245,240,0.2)' : isValentino ? 'rgba(190,10,38,0.25)' : isPrada ? 'rgba(45,45,45,0.3)' : `${brand.colors.text}20`,
                color: isVersace ? brand.colors.primary : isArmani ? '#F5F5F0' : isValentino ? '#6B5B5B' : isPrada ? '#2D2D2D' : brand.colors.text,
              }}
            >
              View All
              <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>

          {/* Products Grid */}
          <AnimatedProductGrid className={`grid sm:grid-cols-2 lg:grid-cols-4 ${isArmani ? 'gap-10' : isValentino ? 'gap-12' : isPrada ? 'gap-10' : 'gap-8'}`}>
            {products.length > 0 ? (
              products.map((product) => (
                <LuxuryProductCard
                  key={product.id}
                  product={product}
                  brandVariant={isVersace ? "versace" : isArmani ? "armani" : isValentino ? "valentino" : isPrada ? "prada" : "default"}
                  colors={{
                    text: isVersace ? '#E8E0D0' : isArmani ? '#F5F5F0' : isValentino ? '#2D2424' : isPrada ? '#2D2D2D' : brand.colors.text,
                    secondary: isVersace ? '#C4B99A' : isArmani ? '#9E958A' : isValentino ? '#6B5B5B' : isPrada ? '#5A5A5A' : brand.colors.secondary,
                    primary: isVersace ? '#C6A75E' : isArmani ? '#F5F5F0' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.primary,
                    cardBg: isVersace ? '#1A1814' : isArmani ? '#2D2D2D' : isValentino ? '#FDF5F3' : isPrada ? '#F5F5F5' : '#EBEBEB',
                  }}
                />
              ))
            ) : (
              // Placeholder when no products
              [...Array(4)].map((_, i) => (
                <div key={i} className="group">
                  <div
                    className="relative aspect-[3/4] mb-5 overflow-hidden transition-all duration-700"
                    style={{ backgroundColor: isVersace ? '#1A1814' : isArmani ? '#2D2D2D' : isValentino ? '#FDF5F3' : isPrada ? '#F5F5F5' : '#EBEBEB' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-8 h-8 mx-auto mb-3 border rounded-full flex items-center justify-center opacity-20"
                          style={{ borderColor: isVersace ? brand.colors.primary : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.text }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: isVersace ? brand.colors.primary : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.text }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span
                          className={`text-[10px] tracking-[0.3em] uppercase ${isArmani ? 'font-light' : isValentino ? 'font-editorial italic' : ''}`}
                          style={{
                            color: isVersace ? brand.colors.primary : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.text,
                            opacity: 0.3,
                          }}
                        >
                          Coming Soon
                        </span>
                      </div>
                    </div>
                    {/* Decorative border on hover */}
                    <div
                      className="absolute inset-0 border opacity-0 group-hover:opacity-100 transition-all duration-700"
                      style={{ borderColor: isVersace ? `${brand.colors.primary}40` : isArmani ? 'rgba(245,245,240,0.15)' : isValentino ? 'rgba(190,10,38,0.2)' : isPrada ? 'rgba(26,26,26,0.15)' : `${brand.colors.text}10` }}
                    />
                  </div>
                  <div
                    className="h-4 w-32 mb-2 rounded-sm"
                    style={{ backgroundColor: isVersace ? `${brand.colors.primary}15` : isArmani ? 'rgba(245,245,240,0.08)' : isValentino ? 'rgba(190,10,38,0.08)' : isPrada ? 'rgba(26,26,26,0.08)' : `${brand.colors.text}08` }}
                  />
                  <div
                    className="h-3 w-20 rounded-sm"
                    style={{ backgroundColor: isVersace ? '#E8E0D015' : isArmani ? 'rgba(158,149,138,0.1)' : isValentino ? 'rgba(107,91,91,0.1)' : isPrada ? 'rgba(26,26,26,0.05)' : `${brand.colors.text}05` }}
                  />
                </div>
              ))
            )}
          </AnimatedProductGrid>

          {/* Mobile View All Button */}
          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/storefront"
              className={`inline-flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] uppercase border transition-all duration-500`}
              style={{
                borderColor: isVersace ? `${brand.colors.primary}50` : isArmani ? 'rgba(245,245,240,0.2)' : isValentino ? 'rgba(190,10,38,0.25)' : isPrada ? 'rgba(45,45,45,0.3)' : `${brand.colors.text}20`,
                color: isVersace ? brand.colors.primary : isArmani ? '#F5F5F0' : isValentino ? '#6B5B5B' : isPrada ? '#2D2D2D' : brand.colors.text,
              }}
            >
              View All Pieces
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{
          backgroundColor: isVersace ? brand.colors.background : isArmani ? '#2D2D2D' : isValentino ? '#FDF5F3' : isPrada ? '#FFFFFF' : brand.colors.accent,
        }}
      >
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0">
          <LuxuryDivider
            color={isVersace ? '#C6A75E' : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.primary}
            variant={isValentino ? "flourish" : isArmani ? "minimal" : "default"}
          />
        </div>

        {/* Decorative background elements */}
        {isVersace && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #C6A75E 0%, transparent 70%)' }} />
          </div>
        )}

        <AnimatedSection animation="fade-scale" className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {/* Decorative element above text */}
          <div className="flex justify-center mb-8">
            {isVersace && (
              <svg className="w-12 h-12 opacity-30 animate-pulse-glow" viewBox="0 0 100 100" fill="#C6A75E">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#C6A75E" strokeWidth="0.5" opacity="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#C6A75E" strokeWidth="0.5" opacity="0.3" />
                <text x="50" y="58" textAnchor="middle" fontSize="20" fontFamily="var(--font-cinzel), Cinzel, serif" fill="#C6A75E" opacity="0.6">V</text>
              </svg>
            )}
            {isArmani && (
              <div className="flex items-center gap-4 opacity-30">
                <div className="w-8 h-[1px] bg-[#9E958A]" />
                <span className="text-xs tracking-[0.3em] uppercase font-light" style={{ color: "#9E958A" }}>GA</span>
                <div className="w-8 h-[1px] bg-[#9E958A]" />
              </div>
            )}
            {isValentino && (
              <div className="flex flex-col items-center gap-2 opacity-40">
                <span className="text-2xl font-editorial italic" style={{ color: "#BE0A26" }}>V</span>
                <div className="w-6 h-[1px] bg-[#BE0A26]/50" />
              </div>
            )}
            {isPrada && (
              <div className="flex items-center gap-3 opacity-30">
                <div className="w-3 h-3 border border-[#1a1a1a]/40 rotate-45" />
                <div className="w-3 h-3 border border-[#1a1a1a]/40 rotate-45" />
              </div>
            )}
          </div>

          <p
            className={`text-sm tracking-[0.3em] uppercase mb-4 ${isArmani ? 'font-light' : ''}`}
            style={{
              color: isVersace ? '#C6A75E' : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.primary,
              opacity: 0.6,
            }}
          >
            Continue Exploring
          </p>

          <p
            className={`text-2xl lg:text-3xl xl:text-4xl mb-10 leading-relaxed ${isArmani ? 'font-light' : isValentino ? 'font-editorial italic' : 'font-editorial'}`}
            style={{
              color: isVersace ? '#E8E0D0' : isArmani ? '#F5F5F0' : isValentino ? '#4A3F3F' : isPrada ? '#2D2D2D' : brand.colors.text,
              opacity: 0.9,
            }}
          >
            {isVersace
              ? 'Discover the complete VINDTIA archive'
              : isArmani
              ? 'Explore the complete VINDTIA collection'
              : isValentino
              ? 'Continue your journey through the VINDTIA archive'
              : isPrada
              ? 'Explore more from the VINDTIA collection'
              : 'Discover the full VINDTIA archive'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/storefront"
              className={`font-button inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.2em] uppercase transition-all duration-700 group ${
                isVersace
                  ? 'bg-[#C6A75E] text-[#0A0A0A] hover:bg-[#E5C97A] hover:shadow-[0_0_30px_rgba(198,167,94,0.3)]'
                  : isArmani
                  ? 'border border-[#F5F5F0]/30 hover:border-[#F5F5F0]/60 hover:bg-[#F5F5F0]/5'
                  : isValentino
                  ? 'bg-[#BE0A26] text-white hover:bg-[#9A0820] hover:shadow-[0_0_30px_rgba(190,10,38,0.2)]'
                  : isPrada
                  ? 'bg-[#1a1a1a] text-[#E8E0D0] hover:bg-[#2D2D2D]'
                  : 'border-2 hover:scale-105'
              }`}
              style={{
                borderColor: isVersace ? 'transparent' : isArmani ? undefined : isValentino ? 'transparent' : isPrada ? 'transparent' : brand.colors.text,
                color: isVersace ? '#0A0A0A' : isArmani ? '#F5F5F0' : isValentino ? '#FFFFFF' : isPrada ? '#E8E0D0' : brand.colors.text,
              }}
            >
              View All Pieces
              <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/designers"
              className={`font-button inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.2em] uppercase border transition-all duration-500 ${
                isVersace
                  ? 'border-[#C6A75E]/40 text-[#C6A75E] hover:border-[#C6A75E] hover:bg-[#C6A75E]/10'
                  : isArmani
                  ? 'border-[#9E958A]/30 text-[#9E958A] hover:border-[#9E958A]/50'
                  : isValentino
                  ? 'border-[#BE0A26]/30 text-[#6B5B5B] hover:border-[#BE0A26]/50'
                  : isPrada
                  ? 'border-[#1a1a1a]/30 text-[#2D2D2D] hover:border-[#1a1a1a]/50'
                  : ''
              }`}
            >
              All Designers
            </Link>
          </div>
        </AnimatedSection>

        {/* Bottom brand signature */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
          <p
            className="text-[10px] tracking-[0.5em] uppercase"
            style={{ color: isVersace ? '#C6A75E' : isArmani ? '#9E958A' : isValentino ? '#BE0A26' : isPrada ? '#1a1a1a' : brand.colors.primary }}
          >
            VINDTIA
          </p>
        </div>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { slug: "versace" },
    { slug: "giorgio-armani" },
    { slug: "valentino" },
    { slug: "prada" },
  ];
}
