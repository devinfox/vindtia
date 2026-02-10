import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Cinzel } from "next/font/google";
import Navbar from "@/components/Navbar";

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
  },
  "giorgio-armani": {
    name: "Giorgio Armani",
    founded: "1975",
    founder: "Giorgio Armani",
    origin: "Milan, Italy",
    headquarters: "Milan, Italy",
    colors: {
      primary: "#1C1C1C",
      secondary: "#8B8680",
      accent: "#C4B99A",
      background: "#F5F5F5",
      text: "#1C1C1C",
    },
    history: [
      "Giorgio Armani founded his eponymous label in 1975, revolutionizing fashion with his deconstructed, unstructured jackets that liberated both men and women from rigid tailoring.",
    ],
    signature: "Understated elegance, neutral palettes, and impeccable tailoring",
    pattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z' fill='%231C1C1C' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  },
  valentino: {
    name: "Valentino",
    founded: "1960",
    founder: "Valentino Garavani",
    origin: "Rome, Italy",
    headquarters: "Rome, Italy",
    colors: {
      primary: "#BE0A26", // Valentino Red
      secondary: "#1A1A1A",
      accent: "#F5F0E8",
      background: "#FFFAF5",
      text: "#1A1A1A",
    },
    history: [
      "Valentino Garavani founded his haute couture house in Rome in 1960, becoming the last great couturier of the 20th century.",
    ],
    signature: "Valentino Red, romantic elegance, and haute couture craftsmanship",
    pattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23BE0A26' fill-opacity='0.03'/%3E%3C/svg%3E")`,
  },
  prada: {
    name: "Prada",
    founded: "1913",
    founder: "Mario Prada",
    origin: "Milan, Italy",
    headquarters: "Milan, Italy",
    colors: {
      primary: "#000000",
      secondary: "#FFFFFF",
      accent: "#1A1A1A",
      background: "#F8F8F8",
      text: "#000000",
    },
    history: [
      "Mario Prada founded the luxury leather goods shop in Milan in 1913. Under Miuccia Prada's leadership since 1978, the brand became synonymous with intellectual fashion.",
    ],
    signature: "Minimalist sophistication, nylon innovations, and intellectual fashion",
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23000000' stroke-opacity='0.02' stroke-width='1'/%3E%3C/svg%3E")`,
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

  // Fetch products for this brand from database
  let products: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        era,
        product_media (
          url
        )
      `)
      .eq("designer_id", slug) // This would need to match your database structure
      .limit(8);

    if (data) products = data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  const isVersace = slug === "versace";

  return (
    <div
      className={`min-h-screen ${isVersace ? cinzel.variable : ""}`}
      style={{
        backgroundColor: brand.colors.background,
        color: brand.colors.text,
      }}
    >
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
          backgroundColor: brand.colors.background,
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

        {/* Dark overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isVersace
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
              : `linear-gradient(135deg, ${brand.colors.background} 0%, ${brand.colors.accent} 100%)`
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)'
          }}
        />

        {/* Decorative corner borders - Versace gold */}
        {isVersace && (
          <>
            {/* Top Left Corner */}
            <div className="absolute top-6 left-6 lg:top-10 lg:left-10 w-16 h-16 lg:w-24 lg:h-24 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, #C6A75E, transparent)' }} />
              <div className="absolute top-0 left-0 h-full w-[1px]" style={{ background: 'linear-gradient(180deg, #C6A75E, transparent)' }} />
              {/* Corner ornament */}
              <svg className="absolute -top-1 -left-1 w-6 h-6 lg:w-8 lg:h-8 text-[#C6A75E]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z" opacity="0.3"/>
              </svg>
            </div>
            {/* Top Right Corner */}
            <div className="absolute top-6 right-6 lg:top-10 lg:right-10 w-16 h-16 lg:w-24 lg:h-24 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-[1px]" style={{ background: 'linear-gradient(270deg, #C6A75E, transparent)' }} />
              <div className="absolute top-0 right-0 h-full w-[1px]" style={{ background: 'linear-gradient(180deg, #C6A75E, transparent)' }} />
            </div>
            {/* Bottom Left Corner */}
            <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 w-16 h-16 lg:w-24 lg:h-24 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, #C6A75E, transparent)' }} />
              <div className="absolute bottom-0 left-0 h-full w-[1px]" style={{ background: 'linear-gradient(0deg, #C6A75E, transparent)' }} />
            </div>
            {/* Bottom Right Corner */}
            <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 lg:w-24 lg:h-24 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-[1px]" style={{ background: 'linear-gradient(270deg, #C6A75E, transparent)' }} />
              <div className="absolute bottom-0 right-0 h-full w-[1px]" style={{ background: 'linear-gradient(0deg, #C6A75E, transparent)' }} />
            </div>
          </>
        )}

        <div className="relative z-10 text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
          {/* Shop by Designer - thin sans serif */}
          {isVersace && (
            <p className="font-sans text-xs lg:text-sm tracking-[0.4em] uppercase text-[#C6A75E]/80 mb-6">
              Shop by Designer
            </p>
          )}

          {/* Brand Name */}
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mb-4 ${isVersace ? "tracking-[0.2em]" : "font-display tracking-wider"}`}
            style={isVersace ? {
              fontFamily: "var(--font-cinzel), Cinzel, serif",
              fontWeight: 400,
              background: `linear-gradient(180deg, #E5C97A 0%, #C6A75E 40%, #A8893C 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            } : { color: brand.colors.text }}
          >
            {brand.name.toUpperCase()}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl lg:text-2xl mb-6 ${isVersace ? "font-editorial italic" : ""}`}
            style={{ color: isVersace ? '#E5C97A' : brand.colors.secondary }}
          >
            {isVersace ? "House of Medusa" : `Est. ${brand.founded}`}
          </p>

          {/* Tagline */}
          <p
            className="text-sm lg:text-base tracking-[0.2em] uppercase mb-6"
            style={{ color: isVersace ? '#C6A75E' : brand.colors.secondary }}
          >
            Est. {brand.founded} · {brand.origin}
          </p>

          {/* Signature */}
          <p
            className="font-editorial text-base lg:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: isVersace ? '#E8E0D0' : brand.colors.secondary, opacity: 0.85 }}
          >
            {brand.signature}
          </p>

          {/* CTA Button */}
          <Link
            href="/storefront"
            className={`inline-block px-10 py-4 text-xs lg:text-sm tracking-[0.25em] uppercase border transition-all duration-500 ${
              isVersace
                ? "border-[#C6A75E]/50 text-[#E5C97A] hover:bg-[#C6A75E]/10 hover:border-[#C6A75E]"
                : "border-current"
            }`}
          >
            View the Archive
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span
            className="text-xs tracking-[0.3em] uppercase opacity-50"
            style={{ color: isVersace ? '#C6A75E' : brand.colors.text }}
          >
            Scroll
          </span>
          <svg
            className="w-4 h-4 opacity-50"
            fill="none"
            stroke={isVersace ? '#C6A75E' : brand.colors.text}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* History Section */}
      <section
        className="relative py-24 lg:py-32"
        style={{
          backgroundColor: isVersace ? '#0D0D0D' : brand.colors.background,
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2
            className={`text-3xl lg:text-4xl mb-12 ${isVersace ? "tracking-[0.2em] uppercase" : "font-display tracking-wide"}`}
            style={isVersace ? {
              fontFamily: "var(--font-cinzel), Cinzel, serif",
              fontWeight: 500,
              color: brand.colors.primary,
            } : { color: brand.colors.text }}
          >
            The House of {brand.name}
          </h2>

          <div className="space-y-8">
            {brand.history.map((paragraph, index) => (
              <p
                key={index}
                className="font-editorial text-lg lg:text-xl leading-relaxed"
                style={{ color: isVersace ? '#E8E0D0' : brand.colors.text, opacity: 0.85 }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Founder info */}
          <div
            className="mt-16 pt-8 border-t"
            style={{ borderColor: isVersace ? `${brand.colors.primary}20` : `${brand.colors.text}10` }}
          >
            <p
              className="text-sm tracking-widest uppercase"
              style={{ color: isVersace ? brand.colors.primary : brand.colors.secondary }}
            >
              Founded by {brand.founder}
            </p>
            <p
              className="text-sm mt-2 opacity-60"
              style={{ color: isVersace ? '#E8E0D0' : brand.colors.text }}
            >
              Headquarters: {brand.headquarters}
            </p>
          </div>
        </div>
      </section>

      {/* Archive Section */}
      <section
        className="relative py-24 lg:py-32"
        style={{
          backgroundColor: isVersace ? '#141210' : '#F5F5F5',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2
                className={`text-2xl lg:text-3xl ${isVersace ? "tracking-[0.2em] uppercase" : "font-display tracking-wide"}`}
                style={isVersace ? {
                  fontFamily: "var(--font-cinzel), Cinzel, serif",
                  fontWeight: 500,
                  color: brand.colors.primary,
                } : { color: brand.colors.text }}
              >
                {brand.name} Archive
              </h2>
              <p
                className="mt-2 text-sm opacity-60"
                style={{ color: isVersace ? '#E8E0D0' : brand.colors.text }}
              >
                Explore authenticated vintage pieces from the {brand.name} archives
              </p>
            </div>
            <Link
              href="/storefront"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase border transition-all duration-500"
              style={{
                borderColor: isVersace ? `${brand.colors.primary}40` : `${brand.colors.text}20`,
                color: isVersace ? brand.colors.primary : brand.colors.text,
              }}
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/storefront/product/${product.id}`}
                  className="group"
                >
                  <div
                    className="relative aspect-[3/4] mb-4 overflow-hidden"
                    style={{ backgroundColor: isVersace ? '#1A1814' : '#EBEBEB' }}
                  >
                    {product.product_media?.[0]?.url ? (
                      <Image
                        src={product.product_media[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-xs tracking-widest uppercase opacity-30"
                          style={{ color: isVersace ? brand.colors.primary : brand.colors.text }}
                        >
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <h3
                    className="font-editorial text-lg mb-1"
                    style={{ color: isVersace ? '#E8E0D0' : brand.colors.text }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="text-sm opacity-60"
                    style={{ color: isVersace ? '#C4B99A' : brand.colors.secondary }}
                  >
                    {product.era || "Vintage"}
                  </p>
                </Link>
              ))
            ) : (
              // Placeholder when no products
              [...Array(4)].map((_, i) => (
                <div key={i} className="group">
                  <div
                    className="relative aspect-[3/4] mb-4"
                    style={{ backgroundColor: isVersace ? '#1A1814' : '#EBEBEB' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-xs tracking-widest uppercase opacity-20"
                        style={{ color: isVersace ? brand.colors.primary : brand.colors.text }}
                      >
                        Coming Soon
                      </span>
                    </div>
                    {/* Decorative border on hover */}
                    <div
                      className="absolute inset-0 border opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ borderColor: isVersace ? `${brand.colors.primary}30` : `${brand.colors.text}10` }}
                    />
                  </div>
                  <div
                    className="h-4 w-32 mb-2"
                    style={{ backgroundColor: isVersace ? `${brand.colors.primary}10` : `${brand.colors.text}05` }}
                  />
                  <div
                    className="h-3 w-20"
                    style={{ backgroundColor: isVersace ? '#E8E0D010' : `${brand.colors.text}03` }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        className="relative py-20"
        style={{
          backgroundColor: isVersace ? brand.colors.background : brand.colors.accent,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p
            className="font-editorial text-2xl lg:text-3xl italic mb-8"
            style={{ color: isVersace ? '#C4B99A' : brand.colors.text }}
          >
            Discover the full VINDTIA archive
          </p>
          <Link
            href="/storefront"
            className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase border-2 transition-all duration-500 hover:scale-105"
            style={{
              borderColor: isVersace ? brand.colors.primary : brand.colors.text,
              color: isVersace ? brand.colors.primary : brand.colors.text,
            }}
          >
            Explore All Designers
          </Link>
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
