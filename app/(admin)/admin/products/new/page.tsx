import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: designers } = await supabase
    .from("designers")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Add New Product
      </h1>
      <ProductForm designers={designers || []} />
    </div>
  );
}
