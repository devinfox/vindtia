import Link from "next/link";
import Image from "next/image";

type ProductWithRelations = {
  id: string;
  name: string;
  price_per_rental: number;
  designer: {
    id: string;
    name: string;
  } | null;
  media: {
    id: string;
    url: string;
    sort_order: number;
  }[];
  tier_required: number;
  size: string | null;
  color: string | null;
  category: string | null;
};

type ProductGridProps = {
  products: ProductWithRelations[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => {
        const featuredImage = product.media.sort(
          (a, b) => a.sort_order - b.sort_order
        )[0];

        return (
          <Link
            key={product.id}
            href={`/storefront/product/${product.id}`}
            className="group"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-[var(--background-deep)] overflow-hidden mb-5 border border-[var(--gold)]/10 vignette">
              {featuredImage ? (
                <Image
                  src={featuredImage.url}
                  alt={product.name}
                  fill
                  className="object-cover filter-film group-hover:scale-105 transition-luxury"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-[var(--gold)]/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[var(--foreground)]/40 text-xs tracking-wider uppercase">No Image</span>
                  </div>
                </div>
              )}

              {/* Tier Badge */}
              {product.tier_required > 0 && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--espresso)]/90 backdrop-blur-sm border border-[var(--gold)]/20">
                  <span className="text-[var(--gold)] text-xs tracking-[0.15em] uppercase">
                    Tier {product.tier_required}
                  </span>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[var(--espresso)]/0 group-hover:bg-[var(--espresso)]/20 transition-luxury flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-6 py-3 border border-[#F5F0E8]/80 text-[#F5F0E8] text-xs tracking-[0.2em] uppercase transform translate-y-4 group-hover:translate-y-0 transition-luxury">
                  View Details
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              {/* Designer Name */}
              {product.designer && (
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--gold)]">
                  {product.designer.name}
                </p>
              )}

              {/* Product Name */}
              <h3 className="font-display text-lg text-[var(--foreground)] group-hover:text-[var(--wine)] transition-colors leading-tight">
                {product.name}
              </h3>

              {/* Price and Size */}
              <div className="flex items-center justify-between pt-2">
                <p className="font-editorial text-[var(--foreground)]/80">
                  <span className="text-lg">${product.price_per_rental.toFixed(0)}</span>
                  <span className="text-sm text-[var(--foreground)]/50 ml-1">/ rental</span>
                </p>
                {product.size && (
                  <p className="text-xs tracking-wider text-[var(--foreground)]/50 uppercase">
                    {product.size}
                  </p>
                )}
              </div>

              {/* Decorative line on hover */}
              <div className="h-px bg-[var(--gold)]/0 group-hover:bg-[var(--gold)]/30 transition-luxury mt-3" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
