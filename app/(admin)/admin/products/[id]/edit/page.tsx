import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

type Params = Promise<{ id: string }>;

export default async function EditProductPage(props: { params: Params }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      media:product_media(id, url, sort_order),
      inventory:inventory(id, quantity)
    `
    )
    .eq("id", params.id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: designers } = await supabase
    .from("designers")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Edit Product
      </h1>
      <ProductForm product={product} designers={designers || []} />
    </div>
  );
}
