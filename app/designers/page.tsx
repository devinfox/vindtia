import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import DesignerCarousel from "@/components/DesignerCarousel";

export const metadata = {
  title: "Designers | VINDTIA",
  description: "Explore our curated collection of archive designers - Versace, Armani, Valentino, Prada and more.",
};

export default function DesignersPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <Navbar transparent={true} sticky={true} />

      {/* Hero Carousel */}
      <DesignerCarousel />

      {/* Featured Archive Designers - Museum Exhibition */}
      <section
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          backgroundImage: "url('/vindtia-textured-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Atmospheric overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl text-[#F5F0E8] mb-4 tracking-wide italic">
              The Archive Collection
            </h2>
            <p className="font-editorial text-base lg:text-lg text-[#C4B99A]/80 italic mb-8">
              Fashion houses that defined eras, now at your fingertips.
            </p>
            {/* Decorative divider with ornament */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-[#C4B99A]/50" />
              <div className="text-[#C4B99A]/60 text-xs">✦</div>
              <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-[#C4B99A]/50" />
            </div>
          </div>

          {/* Museum Exhibition Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10 lg:gap-8 mb-16"
            style={{ perspective: "1000px" }}
          >
            {[
              { slug: "versace", logo: "/versace-logo.png", name: "Versace", category: "MILAN" },
              { slug: "giorgio-armani", logo: "/armani-logo-black.png", name: "Giorgio Armani", category: "MILAN" },
              { slug: "valentino", logo: "/valentino-logo-black.png", name: "Valentino", category: "ROMAN COUTURE" },
              { slug: "prada", logo: "/Prada-Logo-black.png", name: "Prada", category: "ITALIAN MINIMALISM" },
            ].map((designer) => (
              <Link key={designer.slug} href={`/brand/${designer.slug}`} className="group block max-w-[280px] sm:max-w-none mx-auto">
                {/* Category Label */}
                <p className="text-center text-[#C4B99A]/70 text-[10px] lg:text-xs tracking-[0.3em] uppercase mb-6 font-light">
                  {designer.category}
                </p>

                {/* Card Container */}
                <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                  {/* 3D Card Container */}
                  <div
                    className="relative transition-all duration-500 group-hover:-translate-y-1"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Card Front Face */}
                    <div
                      className="relative aspect-[3/4] bg-[#F5F2ED]"
                      style={{
                        boxShadow: `
                          4px 4px 0 0 rgba(200,195,185,1),
                          8px 8px 0 0 rgba(180,175,165,1),
                          12px 12px 20px 0 rgba(0,0,0,0.3),
                          20px 25px 40px -5px rgba(0,0,0,0.25)
                        `,
                      }}
                    >
                      {/* Paper texture overlay */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Subtle gradient for depth */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.03) 100%)",
                        }}
                      />

                      {/* Logo centered */}
                      <div className="relative h-full flex items-center justify-center p-10">
                        <img
                          src={designer.logo}
                          alt={`${designer.name} logo`}
                          className="max-w-[75%] max-h-[50%] object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ filter: "contrast(1.05)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card shadow on floor */}
                  <div
                    className="absolute -bottom-4 left-1/2 w-[85%] h-6 pointer-events-none"
                    style={{
                      transform: "translateX(-50%)",
                      background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)",
                      filter: "blur(8px)",
                    }}
                  />

                  {/* Subtle floor glow/reflection */}
                  <div
                    className="absolute -bottom-8 left-1/2 w-[70%] h-10 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    style={{
                      transform: "translateX(-50%)",
                      background:
                        "radial-gradient(ellipse at center, rgba(255,252,245,0.5) 0%, rgba(255,252,245,0.2) 40%, transparent 70%)",
                      filter: "blur(10px)",
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Accent */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-[1px] bg-[#C4B99A]/30" />
              <div className="w-1 h-1 rounded-full bg-[#C4B99A]/40" />
              <div className="w-16 h-[1px] bg-[#C4B99A]/30" />
            </div>
            <p className="text-[#C4B99A]/60 text-xs tracking-[0.4em] uppercase">
              Intellectual Luxury
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon / More Designers */}
      <section className="py-20 bg-[var(--background-warm)] texture-paper">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase mb-4">
            Coming Soon
          </p>
          <h3 className="font-display text-2xl lg:text-3xl text-[var(--foreground)] mb-6 tracking-wide">
            More Houses Joining the Archive
          </h3>
          <p className="font-editorial text-[var(--foreground)]/60 mb-8 max-w-lg mx-auto">
            We&apos;re curating collections from legendary fashion houses.
            Gucci, Dior, Chanel, and more are on the horizon.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[var(--foreground)]/30 font-display text-lg tracking-wider">
            <span>Gucci</span>
            <span className="text-[var(--gold)]/20">·</span>
            <span>Dior</span>
            <span className="text-[var(--gold)]/20">·</span>
            <span>Chanel</span>
            <span className="text-[var(--gold)]/20">·</span>
            <span>YSL</span>
            <span className="text-[var(--gold)]/20">·</span>
            <span>Givenchy</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-16 text-[#F5F0E8]/60"
        style={{
          backgroundImage: "url('/vindtia-textured-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <span className="font-display text-2xl lg:text-3xl tracking-[0.25em] text-white">
              VINDTIA
            </span>
            <div className="rule-gold w-16" />
            <p className="font-editorial text-sm tracking-wider">
              Archive Couture, Reimagined
            </p>
            <div className="flex gap-8 text-xs tracking-widest uppercase">
              <Link href="/storefront" className="hover:text-[var(--gold)] transition-colors">
                Archive
              </Link>
              <Link href="/designers" className="hover:text-[var(--gold)] transition-colors">
                Designers
              </Link>
              <Link href="/signup" className="hover:text-[var(--gold)] transition-colors">
                Membership
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
