import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

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

    // Update product
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (productError) throw productError;

    // Update or create inventory
    if (quantity !== undefined) {
      const { data: existingInventory } = await supabase
        .from("inventory")
        .select("id")
        .eq("product_id", params.id)
        .single();

      if (existingInventory) {
        await supabase
          .from("inventory")
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq("product_id", params.id);
      } else {
        await supabase
          .from("inventory")
          .insert([{ product_id: params.id, quantity }]);
      }
    }

    // Update media (delete all and recreate)
    if (mediaUrls !== undefined) {
      // Delete existing media
      await supabase.from("product_media").delete().eq("product_id", params.id);

      // Insert new media
      if (mediaUrls.length > 0) {
        const mediaRecords = mediaUrls.map((url: string, index: number) => ({
          product_id: params.id,
          url,
          sort_order: index,
        }));

        await supabase.from("product_media").insert(mediaRecords);
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

    const supabase = await createClient();

    // Delete product (cascade will handle media and inventory)
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
