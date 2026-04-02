import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import DesignerFilter from "@/components/admin/DesignerFilter";
import ProductSpreadsheet from "@/components/admin/ProductSpreadsheet";
import ProductViewToggle from "@/components/admin/ProductViewToggle";

type SearchParams = Promise<{
  designer?: string;
  view?: string;
}>;

export default async function ProductsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const viewMode = searchParams.view || "spreadsheet";

  // Build query
  let query = supabase
    .from("products")
    .select(
      `
      *,
      designer:designers(id, name),
      media:product_media(id, url, sort_order),
      inventory(id, quantity)
    `
    )
    .order("created_at", { ascending: false });

  if (searchParams.designer) {
    query = query.eq("designer_id", searchParams.designer);
  }

  const { data: products } = await query;

  // Get all designers for filter and spreadsheet
  const { data: designers } = await supabase
    .from("designers")
    .select("id, name")
    .order("name");

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
            <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
              Inventory
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
            Products
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ProductViewToggle currentView={viewMode} />
          {viewMode === "cards" && (
            <Link
              href="/admin/products/new"
              className="font-button px-6 py-3 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-all duration-500"
            >
              + Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Filters - only show in card view */}
      {viewMode === "cards" && designers && designers.length > 0 && (
        <div className="mb-8">
          <Suspense fallback={<div className="h-10" />}>
            <DesignerFilter designers={designers} />
          </Suspense>
        </div>
      )}

      {/* Spreadsheet View */}
      {viewMode === "spreadsheet" && (
        <ProductSpreadsheet
          initialProducts={products || []}
          initialDesigners={designers || []}
        />
      )}

      {/* Card View */}
      {viewMode === "cards" && (
        <>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => {
                const featuredImage = product.media.sort(
                  (a: any, b: any) => a.sort_order - b.sort_order
                )[0];

                return (
                  <div
                    key={product.id}
                    className="bg-[var(--background)] border border-[var(--gold)]/10 overflow-hidden group hover:border-[var(--gold)]/30 transition-all duration-500"
                  >
                    <div className="relative aspect-[3/4] bg-[var(--background-warm)]">
                      {featuredImage ? (
                        <img
                          src={featuredImage.url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[var(--foreground)]/30 font-editorial italic text-sm">
                          No image
                        </div>
                      )}
                      {product.archive && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-[var(--gold)] text-[#1a1a1a] font-button text-[9px] tracking-[0.1em] uppercase">
                          Archived
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-editorial text-[var(--foreground)]">
                          {product.name}
                        </h3>
                        {product.designer && (
                          <p className="text-xs text-[var(--foreground)]/50 italic">
                            {product.designer.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--foreground)] font-editorial">
                          ${product.price_per_rental}
                        </span>
                        <span className="text-[var(--gold)] text-[10px] tracking-[0.1em] uppercase">
                          Tier {product.tier_required}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="flex-1 font-button px-3 py-2 border border-[var(--gold)]/30 text-[10px] tracking-[0.1em] uppercase text-center text-[var(--foreground)] hover:bg-[var(--gold)]/5 hover:border-[var(--gold)] transition-all duration-300"
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
            <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-12 text-center">
              <p className="font-editorial text-[var(--foreground)]/60 italic mb-6">
                No products yet. Add your first product to get started.
              </p>
              <Link
                href="/admin/products/new"
                className="font-button inline-block px-8 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-all duration-500"
              >
                + Add Product
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
