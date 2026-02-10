import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

type SearchParams = Promise<{
  designer?: string;
}>;

export default async function ProductsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("products")
    .select(
      `
      *,
      designer:designers(id, name),
      media:product_media(id, url, sort_order)
    `
    )
    .order("created_at", { ascending: false });

  if (searchParams.designer) {
    query = query.eq("designer_id", searchParams.designer);
  }

  const { data: products } = await query;

  // Get all designers for filter
  const { data: designers } = await supabase
    .from("designers")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      {designers && designers.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            Filter by designer:
          </label>
          <select
            value={searchParams.designer || ""}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) {
                url.searchParams.set("designer", e.target.value);
              } else {
                url.searchParams.delete("designer");
              }
              window.location.href = url.toString();
            }}
            className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
          >
            <option value="">All designers</option>
            {designers.map((designer: { id: string; name: string }) => (
              <option key={designer.id} value={designer.id}>
                {designer.name}
              </option>
            ))}
          </select>
          {searchParams.designer && (
            <Link
              href="/admin/products"
              className="text-sm text-red-600 dark:text-red-500 hover:underline"
            >
              Clear filter
            </Link>
          )}
        </div>
      )}

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => {
            const featuredImage = product.media.sort(
              (a: any, b: any) => a.sort_order - b.sort_order
            )[0];

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
              >
                <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900">
                  {featuredImage ? (
                    <img
                      src={featuredImage.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-600 text-sm">
                      No image
                    </div>
                  )}
                  {product.archive && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded">
                      Archived
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-black dark:text-white">
                      {product.name}
                    </h3>
                    {product.designer && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {product.designer.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black dark:text-white font-medium">
                      ${product.price_per_rental}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500 text-xs">
                      Tier {product.tier_required}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex-1 px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs text-center text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No products yet. Add your first product to get started.
          </p>
          <Link
            href="/admin/products/new"
            className="inline-block px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            + Add Product
          </Link>
        </div>
      )}
    </div>
  );
}
