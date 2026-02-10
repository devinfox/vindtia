import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

export default async function Home() {
  let user = null;
  let featuredProducts = null;
  let designers = null;

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
  } catch (error) {
    // Supabase connection failed - continue with placeholder data
    console.error("Supabase connection error:", error);
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image */}
        <Image
          src="/vindtia-homepage-banner.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)'
        }} />

        {/* Navbar */}
        <Navbar transparent={true} sticky={false} />

        {/* Main Content - Left Aligned */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full pl-6 lg:pl-12 xl:pl-16">
            <div className="max-w-xl">
              {/* Eyebrow */}
              <p className="text-[#C4B99A] text-xs tracking-[0.35em] uppercase mb-10">
                Archive Couture
              </p>

              {/* Main Heading */}
              <h2 className="font-editorial text-4xl lg:text-5xl xl:text-6xl text-[#E8E0D0] leading-[1.15] mb-12">
                Some garments belong
                <br />
                in museums.
                <br />
                <span className="italic">Others belong on you.</span>
              </h2>

              {/* CTAs */}
              <div className="flex flex-row gap-4">
                <Link
                  href="/storefront"
                  className="px-6 lg:px-8 py-3 lg:py-4 border border-[#C4B99A]/50 text-[#E8E0D0] text-xs lg:text-sm tracking-[0.2em] uppercase hover:bg-[#C4B99A]/10 transition-all duration-500"
                >
                  Explore the Archive
                </Link>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-6 lg:px-8 py-3 lg:py-4 border border-[#C4B99A]/50 text-[#E8E0D0] text-xs lg:text-sm tracking-[0.2em] uppercase hover:bg-[#C4B99A]/10 transition-all duration-500"
                  >
                    Your Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="px-6 lg:px-8 py-3 lg:py-4 border border-[#C4B99A]/50 text-[#E8E0D0] text-xs lg:text-sm tracking-[0.2em] uppercase hover:bg-[#C4B99A]/10 transition-all duration-500"
                  >
                    Apply for Membership
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Bottom Center */}
        <div className="relative z-10 pb-10 flex flex-col items-center gap-2">
          <span className="text-[#C4B99A]/70 text-xs tracking-[0.3em] uppercase">
            Scroll
          </span>
          <svg className="w-4 h-4 text-[#C4B99A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* What is VINDTIA Section */}
      <section className="py-24 lg:py-32 bg-[var(--background-warm)] texture-paper">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div>
              <h2 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] mb-2">
                <span className="text-[var(--gold)] tracking-[0.2em] text-sm uppercase block mb-4">What is</span>
                VINDTIA?
              </h2>

              {/* Definition subheader */}
              <div className="mb-10">
                <p className="text-[var(--wine)] font-editorial text-xl lg:text-2xl italic mb-0">
                  vind·tia
                </p>
                <p className="text-[var(--foreground)]/50 text-xs italic mb-1">
                  noun
                </p>
                <p className="text-[var(--foreground)]/60 font-editorial text-sm leading-relaxed">
                  A fusion of <em>vintage</em> and <em>Italia</em> — granting access to archival fashion once reserved for runways, ateliers, and private collections.
                </p>
              </div>

              <div className="space-y-6 text-lg text-[var(--foreground)]/80 font-editorial leading-relaxed">
                <p>
                  VINDTIA is a members-only platform granting access to rare vintage couture and archive designer pieces — preserved, authenticated, and wearable.
                </p>
                <p>
                  From 1970s runway legends to forgotten <em className="text-[var(--wine)]">maison</em> masterpieces, we make history wearable again.
                </p>
              </div>

              {/* Decorative line */}
              <div className="rule-gold w-24 mt-10" />
            </div>

            {/* Right - Image */}
            <div className="relative">
              <div className="aspect-[4/5] relative rounded-sm overflow-hidden vignette">
                <Image
                  src="/vindtia-second-image.jpg"
                  alt="Vintage couture fashion"
                  fill
                  className="object-cover filter-film"
                />
              </div>
              {/* Decorative frame */}
              <div className="absolute -inset-3 border border-[var(--gold)]/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Archive Designers */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-[#2A1F1A] to-[#1A1410] texture-paper">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-2xl lg:text-3xl text-[#F5F0E8] mb-4 tracking-wide">
            Featured Archive Designers
          </h2>
          <div className="rule-gold w-16 mb-12" />

          {/* Designer Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Versace", slug: "versace", founded: "1978", origin: "Milan" },
              { name: "Giorgio Armani", slug: "giorgio-armani", founded: "1975", origin: "Milan" },
              { name: "Valentino", slug: "valentino", founded: "1960", origin: "Rome" },
              { name: "Prada", slug: "prada", founded: "1913", origin: "Milan" },
            ].map((designer) => (
              <Link key={designer.slug} href={`/brand/${designer.slug}`} className="group">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--espresso)] to-[#1A1410] mb-4 overflow-hidden border border-[var(--gold)]/10">
                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-luxury" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5a2.5 2.5 0 0 1 5 0V16h15v2H25v2.5a2.5 2.5 0 0 1-5 0z' fill='%23B8A06A' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                  }} />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <span className="font-display text-2xl lg:text-3xl text-[#F5F0E8] text-center mb-2 group-hover:text-[var(--gold)] transition-luxury">
                      {designer.name}
                    </span>
                    <span className="text-[var(--gold)]/60 text-xs tracking-widest uppercase">
                      Est. {designer.founded}
                    </span>
                    <span className="text-[#F5F0E8]/40 text-xs mt-1">
                      {designer.origin}
                    </span>
                  </div>

                  {/* Hover border effect */}
                  <div className="absolute inset-0 border-2 border-[var(--gold)]/0 group-hover:border-[var(--gold)]/30 transition-luxury" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#F5F0E8]/60 text-xs tracking-[0.15em] uppercase group-hover:text-[var(--gold)] transition-luxury">
                    View Archive
                  </span>
                  <svg className="w-4 h-4 text-[var(--gold)]/50 group-hover:translate-x-1 transition-luxury" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Designer Marquee */}
      <section className="py-12 bg-[var(--background-deep)] border-y border-[var(--gold)]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[var(--foreground)]/40 font-display text-lg tracking-wide">
            {designers && designers.length > 0 ? (
              designers.map((designer, i) => (
                <span key={designer.name} className="flex items-center gap-8">
                  {designer.name}
                  {i < designers.length - 1 && (
                    <span className="text-[var(--gold)]/30">·</span>
                  )}
                </span>
              ))
            ) : (
              <>
                <span>Mugler</span>
                <span className="text-[var(--gold)]/30">·</span>
                <span>Alaïa</span>
                <span className="text-[var(--gold)]/30">·</span>
                <span>Galliano</span>
                <span className="text-[var(--gold)]/30">·</span>
                <span>Gaultier</span>
                <span className="text-[var(--gold)]/30">·</span>
                <span>Versace Atelier</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 lg:py-32 bg-[var(--background-warm)] texture-paper">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-2xl lg:text-3xl text-[var(--foreground)] mb-4 tracking-wide">
              Membership Tiers
            </h2>
            <p className="font-editorial text-xl text-[var(--foreground)]/60 italic">
              Membership is not just access. <span className="text-[var(--wine)]">It&apos;s status.</span>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Discover", desc: "Browse authenticated archive fashion." },
              { num: "02", title: "Reserve", desc: "Select your piece for your dates." },
              { num: "03", title: "Receive", desc: "Delivered insured, styled to perfection." },
              { num: "04", title: "Wear History", desc: "Step into fashion's most coveted eras." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <span className="font-display text-5xl lg:text-6xl text-[var(--gold)]/30 block mb-4">
                  {step.num}
                </span>
                <h3 className="font-display text-xl text-[var(--foreground)] tracking-wide uppercase mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--foreground)]/60 font-editorial">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href={user ? "/upgrade" : "/signup"}
              className="inline-block px-12 py-5 border-2 border-[var(--wine)] text-[var(--wine)] text-sm tracking-[0.2em] uppercase hover:bg-[var(--wine)] hover:text-[#F5F0E8] transition-luxury"
            >
              Apply for Membership
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[var(--espresso)] text-[#F5F0E8]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <Image
              src="/logo.avif"
              alt="VINDTIA"
              width={120}
              height={40}
              className="opacity-60"
            />
            <div className="rule-gold w-16" />
            <p className="font-editorial text-sm tracking-wider">
              Archive Couture, Reimagined
            </p>
            <div className="flex gap-8 text-xs tracking-widest uppercase">
              <Link href="/storefront" className="hover:text-[var(--gold)] transition-colors">
                Archive
              </Link>
              <Link href={user ? "/dashboard" : "/login"} className="hover:text-[var(--gold)] transition-colors">
                {user ? "Dashboard" : "Login"}
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
