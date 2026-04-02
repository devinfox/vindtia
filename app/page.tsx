import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import WhatIsVindtiaCarousel from "@/components/WhatIsVindtiaCarousel";
import FadeInOnScroll from "@/components/FadeInOnScroll";

export default async function Home() {
  let user = null;
  let featuredProducts = null;
  let designers = null;
  let featuredDesigners: { slug: string; name: string; image_url: string | null }[] = [];

  try {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user;

    // Fetch featured products for the archive pieces section
    const { data: products } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        era,
        designers (
          name
        ),
        product_media (
          url
        )
      `)
      .limit(4);
    featuredProducts = products;

    // Fetch designers for the marquee
    const { data: designerData } = await supabase
      .from("designers")
      .select("name")
      .limit(8);
    designers = designerData;

    // Fetch featured designers for the cards
    const { data: featuredData } = await supabase
      .from("designers")
      .select("slug, name, image_url")
      .eq("featured", true)
      .order("name")
      .limit(4);
    if (featuredData) {
      featuredDesigners = featuredData;
    }
  } catch (error) {
    // Supabase connection failed - continue with placeholder data
    console.error("Supabase connection error:", error);
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Hero Background with Image-to-Video Transition */}
        <HeroBanner isLoggedIn={!!user} />

        {/* Navbar */}
        <Navbar transparent={true} sticky={true} />

        {/* Spacer to push scroll indicator to bottom */}
        <div className="flex-1" />

        {/* Enhanced Scroll indicator - Bottom Center */}
        <div className="relative z-20 pb-12 flex flex-col items-center gap-3 animate-pulse">
          <span className="text-[#C4B99A]/60 text-[10px] tracking-[0.4em] uppercase">
            Scroll
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#C4B99A]/40 to-transparent" />
        </div>
      </section>

      {/* What is VINDTIA Section */}
      <section className="relative py-28 lg:py-36 bg-[var(--background-warm)] texture-paper overflow-hidden">
        {/* Subtle ambient glow */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse at 80% 30%, rgba(196,185,154,0.15) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Text */}
            <div>
              <FadeInOnScroll>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-[1px] bg-[var(--gold)]/40" />
                  <span className="text-[var(--gold)] tracking-[0.3em] text-xs uppercase">
                    What is
                  </span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl text-[var(--foreground)] mb-2 tracking-wide">
                  VINDTIA?
                </h2>
              </FadeInOnScroll>

              {/* Definition subheader */}
              <FadeInOnScroll delay={100}>
                <div className="mb-12 mt-6">
                  <p className="text-[#62130e] font-editorial text-2xl lg:text-3xl italic mb-1">
                    vin·chee·uh
                  </p>
                  <p className="text-[var(--foreground)]/40 text-xs italic tracking-wide mb-2">
                    noun
                  </p>
                  <p className="text-[var(--foreground)]/60 font-editorial text-base leading-relaxed max-w-md">
                    A fusion of <em className="text-[var(--foreground)]/80">vintage</em> and <em className="text-[var(--foreground)]/80">Italia</em> — granting access to archival fashion once reserved for runways, ateliers, and private collections.
                  </p>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="space-y-6 text-lg text-[var(--foreground)]/70 font-editorial leading-relaxed">
                  <p>
                    VINDTIA is a members-only platform granting access to rare vintage couture and archive designer pieces — preserved, authenticated, and wearable.
                  </p>
                  <p>
                    From 1970s runway legends to forgotten <em className="text-[#62130e] not-italic">maison</em> masterpieces, we make history wearable again.
                  </p>
                </div>

                {/* Decorative element */}
                <div className="flex items-center gap-4 mt-12">
                  <div className="w-16 h-[1px] bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
                  <div className="w-1 h-1 rounded-full bg-[var(--gold)]/40" />
                </div>
              </FadeInOnScroll>
            </div>

            {/* Right - Image Carousel */}
            <WhatIsVindtiaCarousel />
          </div>
        </div>
      </section>

      {/* Featured Archive Designers - Museum Exhibition */}
      <section
        className="relative py-28 lg:py-36 overflow-hidden"
        style={{
          backgroundImage: "url('/vindtia-textured-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <FadeInOnScroll>
            <div className="text-center mb-10">
              <p className="text-[#C4B99A]/60 text-xs tracking-[0.4em] uppercase mb-4">
                The Collection
              </p>
              <h2 className="font-display text-3xl lg:text-5xl text-[#F5F0E8] mb-6 tracking-wide italic">
                Featured Archive Designers
              </h2>
              <p className="font-editorial text-lg lg:text-xl text-[#C4B99A]/70 italic max-w-xl mx-auto">
                A study in fashion houses that defined eras.
              </p>
              {/* Decorative divider with ornament */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C4B99A]/30 to-[#C4B99A]/50" />
                <div className="text-[#C4B99A]/50 text-sm">✦</div>
                <div className="w-24 h-[1px] bg-gradient-to-l from-transparent via-[#C4B99A]/30 to-[#C4B99A]/50" />
              </div>
            </div>
          </FadeInOnScroll>

          {/* Museum Exhibition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10 lg:gap-10 mb-20" style={{ perspective: '1200px' }}>
            {[
              { slug: "versace", logo: "/versace-logo.png", name: "Versace", category: "MILAN" },
              { slug: "giorgio-armani", logo: "/armani-logo-black.png", name: "Giorgio Armani", category: "MILAN" },
              { slug: "valentino", logo: "/valentino-logo-black.png", name: "Valentino", category: "ROMAN COUTURE" },
              { slug: "prada", logo: "/Prada-Logo-black.png", name: "Prada", category: "ITALIAN MINIMALISM" },
            ].map((designer, index) => (
              <FadeInOnScroll key={designer.slug} delay={index * 100}>
                <Link href={`/brand/${designer.slug}`} className="group block max-w-[280px] sm:max-w-none mx-auto">
                  {/* Category Label */}
                  <p className="text-center text-[#C4B99A]/50 text-[10px] tracking-[0.4em] uppercase mb-6 transition-colors duration-500 group-hover:text-[#C4B99A]/80">
                    {designer.category}
                  </p>

                  {/* Card Container */}
                  <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                    {/* 3D Card Container */}
                    <div
                      className="relative transition-all duration-700 group-hover:-translate-y-2 group-hover:rotate-x-2"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Card Front Face */}
                      <div
                        className="relative aspect-[3/4] bg-[#F5F2ED] transition-shadow duration-700"
                        style={{
                          boxShadow: `
                            4px 4px 0 0 rgba(200,195,185,1),
                            8px 8px 0 0 rgba(180,175,165,1),
                            12px 12px 25px 0 rgba(0,0,0,0.35),
                            20px 30px 50px -5px rgba(0,0,0,0.3)
                          `,
                        }}
                      >
                        {/* Paper texture overlay */}
                        <div
                          className="absolute inset-0 opacity-25"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                          }}
                        />

                        {/* Subtle gradient for depth */}
                        <div
                          className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)',
                          }}
                        />

                        {/* Hover glow */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                          style={{
                            background: 'linear-gradient(145deg, rgba(196,185,154,0.1) 0%, transparent 50%)',
                          }}
                        />

                        {/* Logo centered */}
                        <div className="relative h-full flex items-center justify-center p-10">
                          <img
                            src={designer.logo}
                            alt={`${designer.name} logo`}
                            className="max-w-[75%] max-h-[50%] object-contain opacity-85 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                            style={{ filter: 'contrast(1.05)' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card shadow on floor */}
                    <div
                      className="absolute -bottom-4 left-1/2 w-[85%] h-6 pointer-events-none transition-all duration-700 group-hover:w-[90%] group-hover:-bottom-6"
                      style={{
                        transform: 'translateX(-50%)',
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)',
                        filter: 'blur(10px)',
                      }}
                    />

                    {/* Subtle floor glow/reflection */}
                    <div
                      className="absolute -bottom-8 left-1/2 w-[70%] h-10 pointer-events-none opacity-30 group-hover:opacity-50 transition-all duration-700"
                      style={{
                        transform: 'translateX(-50%)',
                        background: 'radial-gradient(ellipse at center, rgba(255,252,245,0.6) 0%, rgba(255,252,245,0.2) 40%, transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>
                </Link>
              </FadeInOnScroll>
            ))}
          </div>

          {/* Bottom Accent */}
          <FadeInOnScroll>
            <div className="text-center">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="w-16 h-[1px] bg-[#C4B99A]/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C4B99A]/30" />
                <div className="w-16 h-[1px] bg-[#C4B99A]/20" />
              </div>
              <p className="text-[#C4B99A]/50 text-[10px] tracking-[0.5em] uppercase">
                Intellectual Luxury
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Membership Tiers / How It Works */}
      <section className="relative py-28 lg:py-36 bg-[var(--background-warm)] texture-paper overflow-hidden">
        {/* Subtle ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(196,185,154,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <FadeInOnScroll>
            <div className="text-center mb-20">
              <p className="text-[var(--gold)]/60 text-xs tracking-[0.4em] uppercase mb-4">
                The Process
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] mb-6 tracking-wide">
                How It Works
              </h2>
              <p className="font-editorial text-xl text-[var(--foreground)]/50 italic max-w-lg mx-auto">
                Membership is not just access. <span className="text-[#62130e]">It&apos;s status.</span>
              </p>
            </div>
          </FadeInOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { num: "01", title: "Discover", desc: "Browse authenticated archive fashion from legendary houses." },
              { num: "02", title: "Reserve", desc: "Select your piece and secure it for your chosen dates." },
              { num: "03", title: "Receive", desc: "Delivered insured, styled with care and precision." },
              { num: "04", title: "Wear History", desc: "Step into fashion's most coveted eras." },
            ].map((step, index) => (
              <FadeInOnScroll key={step.num} delay={index * 100}>
                <div className="text-center group">
                  <span className="font-display text-6xl lg:text-7xl text-[#62130e] block mb-6 transition-all duration-700 group-hover:scale-110">
                    {step.num}
                  </span>
                  <h3 className="font-display text-lg text-[var(--foreground)] tracking-[0.2em] uppercase mb-4 transition-colors duration-500 group-hover:text-[#62130e]">
                    {step.title}
                  </h3>
                  <p className="text-[var(--foreground)]/50 font-editorial text-sm leading-relaxed max-w-[200px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>

          {/* CTA */}
          <FadeInOnScroll delay={400}>
            <div className="text-center mt-20">
              <Link
                href={user ? "/upgrade" : "/signup"}
                className="font-button group relative inline-block px-14 py-5 border-2 border-[#62130e] text-[#62130e] text-sm tracking-[0.25em] uppercase overflow-hidden transition-all duration-700 hover:text-[#F5F0E8] hover:shadow-[0_0_40px_rgba(98,19,14,0.2)]"
              >
                <span className="relative z-10">Apply for Membership</span>
                <div className="absolute inset-0 bg-[#62130e] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-20 text-[#F5F0E8]/60 overflow-hidden"
        style={{
          backgroundImage: "url('/vindtia-textured-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-10">
            <span className="font-display text-3xl lg:text-4xl tracking-[0.3em] text-white">
              VINDTIA
            </span>

            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--gold)]/40" />
              <div className="w-1 h-1 rounded-full bg-[var(--gold)]/50" />
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--gold)]/40" />
            </div>

            <p className="font-editorial text-sm tracking-wider italic">
              Archive Couture, Reimagined
            </p>

            <div className="flex gap-10 text-xs tracking-[0.2em] uppercase">
              <Link href="/storefront" className="hover:text-[var(--gold)] transition-colors duration-500">
                Archive
              </Link>
              <Link href={user ? "/dashboard" : "/login"} className="hover:text-[var(--gold)] transition-colors duration-500">
                {user ? "Dashboard" : "Login"}
              </Link>
              <Link href="/signup" className="hover:text-[var(--gold)] transition-colors duration-500">
                Membership
              </Link>
            </div>

            <p className="text-[10px] tracking-widest uppercase text-white/20 mt-4">
              © 2026 Vindtia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
