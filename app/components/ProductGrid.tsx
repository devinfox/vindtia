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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-3">
              {featuredImage ? (
                <Image
                  src={featuredImage.url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-600">
                  No image
                </div>
              )}
              {product.tier_required > 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded">
                  Tier {product.tier_required}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                {product.name}
              </h3>
              {product.designer && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {product.designer.name}
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-black dark:text-white">
                  ${product.price_per_rental.toFixed(0)} / rental
                </p>
                {product.size && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {product.size}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
