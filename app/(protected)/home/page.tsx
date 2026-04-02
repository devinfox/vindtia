import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// Placeholder images - to be replaced with real campaign assets
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
    alt: "Model in vintage couture against dramatic backdrop",
  },
  {
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80",
    alt: "Editorial fashion photography with cinematic lighting",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
    alt: "High fashion editorial moment",
  },
];

const CURATIONS = [
  {
    id: 1,
    title: "Whispers of Milano",
    subtitle: "A/W Archive Selection",
    dates: "Dec 18 – Dec 31",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
  },
  {
    id: 2,
    title: "The Velvet Hours",
    subtitle: "Evening Wear Capsule",
    dates: "Dec 20 – Jan 5",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
  },
  {
    id: 3,
    title: "Forgotten Glamour",
    subtitle: "1970s Revival",
    dates: "Dec 22 – Jan 10",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
  },
  {
    id: 4,
    title: "Noir et Blanc",
    subtitle: "Monochrome Masters",
    dates: "Jan 1 – Jan 15",
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80",
  },
];

const DESIGNERS = [
  {
    id: 1,
    name: "Valentino Garavani",
    origin: "Rome, 1962 Archive",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
  {
    id: 2,
    name: "Gianni Versace",
    origin: "Milano, 1978 Collection",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
  },
  {
    id: 3,
    name: "Giorgio Armani",
    origin: "Florence, 1986 Archive",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  },
  {
    id: 4,
    name: "Miuccia Prada",
    origin: "Milano, 1989 Selection",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
  },
];

const STORIES = [
  {
    id: 1,
    title: "The Last Fitting",
    excerpt: "Inside the atelier where time stands still, and every stitch carries the weight of legacy. A meditation on craft, memory, and the garments that outlive us all.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=80",
    layout: "left",
  },
  {
    id: 2,
    title: "Daughters of the Revolution",
    excerpt: "When Yves first showed le smoking, Paris gasped. Forty years later, we trace the lineage of women who dared to wear power.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
    layout: "right",
  },
  {
    id: 3,
    title: "The Color of Memory",
    excerpt: "Valentino red. Schiaparelli pink. The hues that defined eras and the stories woven into their threads.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    layout: "left",
  },
];

const PRESS_LOGOS = [
  { name: "Vogue", opacity: 0.35 },
  { name: "Harper's Bazaar", opacity: 0.35 },
  { name: "W Magazine", opacity: 0.35 },
  { name: "Elle", opacity: 0.35 },
  { name: "L'Officiel", opacity: 0.35 },
];

export default async function AppHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, membership_tier")
    .eq("id", user.id)
    .single();

  // Fetch tier info
  const { data: tierInfo } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("id", profile?.membership_tier || 0)
    .single();

  // Mock data for membership status
  const membershipStatus = {
    tier: profile?.membership_tier || 0,
    tierName: tierInfo?.name || "Free",
    reservationsUsed: 1,
    reservationsTotal: tierInfo?.monthly_rental_limit || 0,
    renewalDate: "January 1, 2025",
  };

  const tierNames = ["Complimentary", "Atelier", "Maison", "Haute Couture"];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#2C2420]">
      {/* Paper texture overlay for entire page */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20400%20400%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27noise%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.8%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />

      {/* ============================================= */}
      {/* SECTION 1 — Hero Slideshow */}
      {/* ============================================= */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Hero Image with warm film treatment */}
        <div className="absolute inset-0">
          <img
            src={HERO_SLIDES[0].image}
            alt={HERO_SLIDES[0].alt}
            className="w-full h-full object-cover filter-film-strong"
            style={{ filter: "sepia(12%) saturate(88%) contrast(94%) brightness(103%)" }}
          />
          {/* Warm vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(61,46,38,0.4)_100%)]" />
          {/* Warm gradient overlay from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F3] via-[#FAF8F3]/20 to-transparent" />
          {/* Side warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F3]/40 via-transparent to-[#FAF8F3]/40" />
          {/* Film grain texture */}
          <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20200%20200%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27grain%27%3E%3CfeTurbulence%20baseFrequency=%270.65%27%20type=%27fractalNoise%27%20numOctaves=%273%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23grain)%27/%3E%3C/svg%3E')]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-32 px-8 md:px-16 lg:px-24">
          {/* Decorative flourish */}
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-px bg-gradient-to-r from-[#B8A06A] to-transparent" />
              <span className="font-display text-sm tracking-[0.4em] text-[#B8A06A] uppercase">Est. MMXXIV</span>
            </div>
          </div>

          {/* Headline - High contrast serif */}
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[0.85] mb-8 max-w-5xl">
            <span className="block text-[#2C2420]">Exclusive</span>
            <span className="block text-[#62130e] italic font-normal">Capsules</span>
            <span className="block text-[#2C2420]/60 text-4xl md:text-5xl lg:text-6xl mt-4 font-editorial font-light">Now Available</span>
          </h1>

          {/* Subtext */}
          <p className="font-editorial text-xl md:text-2xl text-[#2C2420]/60 font-light tracking-wide mb-12 max-w-2xl leading-relaxed">
            Reserve limited vintage archive pieces from the world's most coveted collections
          </p>

          {/* Primary CTA */}
          <Link
            href="/curations"
            className="group inline-flex items-center gap-6"
          >
            <span className="font-editorial text-lg tracking-[0.15em] uppercase text-[#62130e] border-b-2 border-[#B8A06A]/40 pb-2 group-hover:border-[#62130e] transition-all duration-700">
              Explore This Week's Curation
            </span>
            <span className="text-[#62130e] text-2xl group-hover:translate-x-3 transition-transform duration-700">→</span>
          </Link>
        </div>

        {/* Slide Indicators - gold accents */}
        <div className="absolute bottom-12 right-8 md:right-16 flex gap-4">
          {HERO_SLIDES.map((_, index) => (
            <div
              key={index}
              className={`w-16 h-[2px] transition-all duration-500 ${index === 0 ? "bg-[#B8A06A]" : "bg-[#B8A06A]/20"}`}
            />
          ))}
        </div>
      </section>

      {/* Decorative divider */}
      <div className="w-full py-8 flex items-center justify-center">
        <div className="w-2 h-2 rotate-45 border border-[#B8A06A]/40" />
      </div>

      {/* ============================================= */}
      {/* SECTION 2 — "This Week's Curations" */}
      {/* ============================================= */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-24 bg-[#FAF8F3]">
        {/* Section Header - Editorial style */}
        <div className="mb-20 max-w-3xl">
          <p className="font-editorial text-sm tracking-[0.4em] uppercase text-[#B8A06A] mb-6">
            Curated Selections
          </p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#2C2420] leading-[0.9] mb-6">
            This Week's <span className="italic text-[#62130e]">Curations</span>
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-[#B8A06A] to-transparent mt-8" />
        </div>

        {/* Curations - Asymmetric editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
          {/* Large feature */}
          <Link
            href={`/curations/${CURATIONS[0].id}`}
            className="group md:col-span-7 md:row-span-2 relative overflow-hidden shadow-archival"
          >
            <div className="aspect-[4/5] md:aspect-auto md:h-full relative vignette">
              <img
                src={CURATIONS[0].image}
                alt={CURATIONS[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                style={{ filter: "sepia(8%) saturate(92%) contrast(96%) brightness(101%)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2420]/80 via-[#2C2420]/20 to-transparent" />

              {/* Content overlay */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <p className="font-editorial text-xs tracking-[0.3em] uppercase text-[#B8A06A] mb-4">
                  {CURATIONS[0].subtitle}
                </p>
                <h3 className="font-display text-4xl md:text-5xl text-[#FAF8F3] mb-4 tracking-tight leading-tight">
                  {CURATIONS[0].title}
                </h3>
                <p className="font-editorial text-[#FAF8F3]/60 mb-6 text-lg">
                  {CURATIONS[0].dates}
                </p>
                <span className="font-editorial text-sm tracking-[0.2em] uppercase text-[#B8A06A] group-hover:text-[#FAF8F3] transition-colors duration-500 flex items-center gap-3">
                  View Capsule
                  <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
                </span>
              </div>
            </div>
            {/* Gold accent border on hover */}
            <div className="absolute inset-0 border border-[#B8A06A]/0 group-hover:border-[#B8A06A]/30 transition-colors duration-700 pointer-events-none" />
          </Link>

          {/* Smaller cards */}
          {CURATIONS.slice(1).map((curation, index) => (
            <Link
              key={curation.id}
              href={`/curations/${curation.id}`}
              className={`group relative overflow-hidden shadow-archival ${
                index === 0 ? "md:col-span-5" : "md:col-span-5"
              }`}
            >
              <div className="aspect-[4/5] relative vignette">
                <img
                  src={curation.image}
                  alt={curation.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  style={{ filter: "sepia(8%) saturate(92%) contrast(96%) brightness(101%)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2420]/80 via-[#2C2420]/10 to-transparent" />

                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <p className="font-editorial text-xs tracking-[0.25em] uppercase text-[#B8A06A] mb-2">
                    {curation.subtitle}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-[#FAF8F3] mb-2 tracking-tight">
                    {curation.title}
                  </h3>
                  <p className="font-editorial text-sm text-[#FAF8F3]/50 mb-4">
                    {curation.dates}
                  </p>
                  <span className="font-editorial text-xs tracking-[0.2em] uppercase text-[#B8A06A]/80 group-hover:text-[#FAF8F3] transition-colors duration-500 flex items-center gap-2">
                    View Capsule →
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 border border-[#B8A06A]/0 group-hover:border-[#B8A06A]/30 transition-colors duration-700 pointer-events-none" />
            </Link>
          ))}
        </div>
      </section>

      {/* Decorative section break */}
      <div className="bg-[#F7F3ED] py-16">
        <div className="max-w-4xl mx-auto px-8 flex items-center justify-center gap-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8A06A]/30 to-[#B8A06A]/30" />
          <div className="w-3 h-3 rotate-45 border border-[#B8A06A]/40" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B8A06A]/30 to-[#B8A06A]/30" />
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 3 — Featured Designers */}
      {/* ============================================= */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-24 bg-[#F7F3ED]">
        {/* Section Header */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="font-editorial text-sm tracking-[0.4em] uppercase text-[#B8A06A] mb-6">
              The Masters
            </p>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#2C2420] leading-[0.9]">
              Featured <span className="italic text-[#62130e]">Designers</span>
            </h2>
          </div>
          <Link
            href="/designers"
            className="font-editorial text-sm tracking-[0.2em] uppercase text-[#62130e] hover:text-[#4a0f0b] transition-colors duration-500 flex items-center gap-2"
          >
            View All Designers <span>→</span>
          </Link>
        </div>

        {/* Designers Grid - with warm sepia treatment */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {DESIGNERS.map((designer) => (
            <Link
              key={designer.id}
              href={`/designers/${designer.id}`}
              className="group"
            >
              {/* Portrait with archival treatment */}
              <div className="relative aspect-[3/4] overflow-hidden mb-6 shadow-archival">
                <img
                  src={designer.image}
                  alt={designer.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                  style={{ filter: "sepia(15%) saturate(80%) contrast(95%) brightness(100%) grayscale(30%)" }}
                />
                {/* Warm vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(61,46,38,0.2)_100%)]" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#62130e]/0 group-hover:bg-[#62130e]/10 transition-colors duration-700" />
                {/* Gold border accent */}
                <div className="absolute inset-0 border border-[#B8A06A]/0 group-hover:border-[#B8A06A]/40 transition-colors duration-700" />
              </div>

              {/* Info */}
              <h3 className="font-display text-xl md:text-2xl text-[#2C2420] mb-2 tracking-tight group-hover:text-[#62130e] transition-colors duration-500">
                {designer.name}
              </h3>
              <p className="font-editorial text-sm text-[#2C2420]/50 italic mb-3">
                {designer.origin}
              </p>
              <span className="font-editorial text-xs tracking-[0.2em] uppercase text-[#B8A06A] group-hover:text-[#62130e] transition-colors duration-500">
                See Pieces →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 4 — Archive Gate */}
      {/* ============================================= */}
      <section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image with editorial treatment */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1920&q=80"
            alt="The Archive"
            className="w-full h-full object-cover"
            style={{ filter: "sepia(20%) saturate(75%) contrast(90%) brightness(95%)" }}
          />
          {/* Warm overlay */}
          <div className="absolute inset-0 bg-[#2C2420]/60" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(44,36,32,0.5)_100%)]" />
          {/* Side warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#62130e]/20 via-transparent to-[#62130e]/20" />
          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20200%20200%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27grain%27%3E%3CfeTurbulence%20baseFrequency=%270.65%27%20type=%27fractalNoise%27%20numOctaves=%273%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23grain)%27/%3E%3C/svg%3E')]" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-8 py-24">
          {/* Decorative Element */}
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#B8A06A]/60 to-transparent mb-10" />

          <p className="font-editorial text-sm tracking-[0.5em] uppercase text-[#B8A06A] mb-8">
            Members Only
          </p>

          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight text-[#FAF8F3] mb-8 leading-[0.85]">
            The Archive <span className="italic text-[#B8A06A]">Awaits</span>
          </h2>

          <p className="font-editorial text-xl md:text-2xl text-[#FAF8F3]/70 font-light max-w-2xl mb-12 leading-relaxed">
            Rare couture reserved for top-tier members. Pieces that have graced runways,
            red carpets, and the private collections of fashion's elite.
          </p>

          {/* Conditional CTA based on tier */}
          {membershipStatus.tier >= 3 ? (
            <Link
              href="/archive"
              className="px-12 py-5 border-2 border-[#B8A06A] font-editorial text-sm tracking-[0.3em] uppercase text-[#FAF8F3] hover:bg-[#B8A06A] hover:text-[#2C2420] transition-all duration-700"
            >
              Enter Archive
            </Link>
          ) : (
            <Link
              href="/upgrade"
              className="px-12 py-5 bg-[#62130e] border border-[#62130e] font-editorial text-sm tracking-[0.3em] uppercase text-[#FAF8F3] hover:bg-[#4a0f0b] transition-all duration-700"
            >
              Upgrade for Access
            </Link>
          )}

          {/* Decorative Element */}
          <div className="w-px h-20 bg-gradient-to-b from-[#B8A06A]/60 via-transparent to-transparent mt-10" />
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 5 — Membership Status Preview */}
      {/* ============================================= */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-24 bg-[#EFECE4]">
        <div className="max-w-5xl mx-auto">
          {/* Section Label */}
          <div className="text-center mb-16">
            <p className="font-editorial text-sm tracking-[0.4em] uppercase text-[#B8A06A] mb-4">
              Your Membership
            </p>
            <div className="w-12 h-px bg-[#B8A06A]/40 mx-auto" />
          </div>

          {/* Status Cards - Archival paper style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Current Tier */}
            <div className="card-archival p-8 text-center">
              <p className="font-editorial text-xs tracking-[0.3em] uppercase text-[#B8A06A] mb-4">
                Current Tier
              </p>
              <p className="font-display text-3xl text-[#62130e]">
                {tierNames[membershipStatus.tier]}
              </p>
            </div>

            {/* Reservations */}
            <div className="card-archival p-8 text-center">
              <p className="font-editorial text-xs tracking-[0.3em] uppercase text-[#B8A06A] mb-4">
                Monthly Reservations
              </p>
              <p className="font-display text-3xl text-[#2C2420]">
                {membershipStatus.reservationsTotal === null ? (
                  <span className="italic">Unlimited</span>
                ) : (
                  <>
                    <span className="text-[#2C2420]/40">{membershipStatus.reservationsUsed}</span>
                    <span className="text-[#B8A06A] mx-2">/</span>
                    <span>{membershipStatus.reservationsTotal}</span>
                  </>
                )}
              </p>
            </div>

            {/* Renewal Date */}
            <div className="card-archival p-8 text-center">
              <p className="font-editorial text-xs tracking-[0.3em] uppercase text-[#B8A06A] mb-4">
                Renews
              </p>
              <p className="font-display text-2xl text-[#2C2420]">
                {membershipStatus.renewalDate}
              </p>
            </div>

            {/* Upgrade CTA */}
            {membershipStatus.tier < 3 && (
              <Link
                href="/upgrade"
                className="card-archival p-8 flex flex-col justify-center items-center hover:border-[#62130e]/40 transition-all duration-500 group"
              >
                <p className="font-editorial text-xs tracking-[0.3em] uppercase text-[#B8A06A] group-hover:text-[#62130e] transition-colors duration-500 mb-2">
                  Elevate Your Access
                </p>
                <p className="font-display text-xl text-[#62130e] group-hover:text-[#4a0f0b] transition-colors duration-500">
                  Upgrade Tier →
                </p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 6 — Editorial Stories + Lookbooks */}
      {/* ============================================= */}
      <section className="py-24 md:py-32 bg-[#FAF8F3]">
        {/* Section Header */}
        <div className="px-8 md:px-16 lg:px-24 mb-20 max-w-3xl">
          <p className="font-editorial text-sm tracking-[0.4em] uppercase text-[#B8A06A] mb-6">
            From the Editorial Desk
          </p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#2C2420] leading-[0.9]">
            Stories & <span className="italic text-[#62130e]">Lookbooks</span>
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-[#B8A06A] to-transparent mt-8" />
        </div>

        {/* Stories - Editorial asymmetric layout */}
        <div className="space-y-0">
          {STORIES.map((story, index) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className={`group flex flex-col ${
                story.layout === "right" ? "md:flex-row-reverse" : "md:flex-row"
              } min-h-[70vh] border-t border-[#B8A06A]/10`}
            >
              {/* Image */}
              <div className="md:w-3/5 relative overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover min-h-[500px] md:min-h-full transition-transform duration-1000 group-hover:scale-105"
                  style={{ filter: "sepia(10%) saturate(90%) contrast(94%) brightness(102%)" }}
                />
                {/* Warm vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(61,46,38,0.15)_100%)]" />
                <div className="absolute inset-0 bg-[#62130e]/0 group-hover:bg-[#62130e]/5 transition-colors duration-700" />
              </div>

              {/* Content */}
              <div className="md:w-2/5 flex items-center px-8 md:px-16 lg:px-20 py-16 md:py-0 bg-[#FAF8F3]">
                <div className="max-w-lg">
                  <p className="font-editorial text-xs tracking-[0.4em] uppercase text-[#B8A06A] mb-8">
                    Story {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-4xl md:text-5xl text-[#2C2420] mb-8 tracking-tight leading-[1.1] group-hover:text-[#62130e] transition-colors duration-700">
                    {story.title}
                  </h3>
                  <p className="font-editorial text-lg md:text-xl text-[#2C2420]/60 font-light leading-relaxed mb-10">
                    {story.excerpt}
                  </p>
                  <span className="font-editorial text-sm tracking-[0.2em] uppercase text-[#62130e] group-hover:text-[#4a0f0b] transition-colors duration-500 flex items-center gap-4">
                    Read Story
                    <span className="group-hover:translate-x-3 transition-transform duration-700">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 7 — Press + Cultural Credibility */}
      {/* ============================================= */}
      <section className="py-24 md:py-32 px-8 md:px-16 lg:px-24 bg-[#EFECE4] border-t border-[#B8A06A]/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-editorial text-xs tracking-[0.5em] uppercase text-[#B8A06A] mb-16">
            As Featured In
          </p>

          {/* Press Logos - muted elegance */}
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {PRESS_LOGOS.map((logo) => (
              <span
                key={logo.name}
                className="font-display text-2xl md:text-3xl tracking-[0.1em] text-[#2C2420] italic"
                style={{ opacity: logo.opacity }}
              >
                {logo.name}
              </span>
            ))}
          </div>

          {/* Decorative ending */}
          <div className="mt-20 flex items-center justify-center gap-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#B8A06A]/30" />
            <div className="w-2 h-2 rotate-45 border border-[#B8A06A]/40" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#B8A06A]/30" />
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-8 bg-[#EFECE4]" />
    </div>
  );
}
