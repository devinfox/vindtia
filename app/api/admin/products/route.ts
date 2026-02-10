import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const {
      name,
      designer_id,
      description,
      price_per_rental,
      size,
      color,
      category,
      condition,
      era,
      material,
      archive,
      tier_required,
      quantity,
      mediaUrls,
    } = await req.json();

    if (!name || price_per_rental === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
          designer_id: designer_id || null,
          description,
          price_per_rental,
          size,
          color,
          category,
          condition,
          era,
          material,
          archive: archive || false,
          tier_required: tier_required || 1,
        },
      ])
      .select()
      .single();

    if (productError) throw productError;

    // Create inventory record
    if (quantity !== undefined) {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert([{ product_id: product.id, quantity }]);

      if (inventoryError) throw inventoryError;
    }

    // Create media records
    if (mediaUrls && mediaUrls.length > 0) {
      const mediaRecords = mediaUrls.map((url: string, index: number) => ({
        product_id: product.id,
        url,
        sort_order: index,
      }));

      const { error: mediaError } = await supabase
        .from("product_media")
        .insert(mediaRecords);

      if (mediaError) throw mediaError;
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
