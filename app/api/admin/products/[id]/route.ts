import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { generateProductAIDescription } from "@/lib/ai/generate-description";

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

    const {
      name,
      sku,
      designer_id,
      description,
      price_per_rental,
      size,
      color,
      category,
      condition,
      era,
      material,
      style,
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

    // Helper to convert empty strings to null
    const nullIfEmpty = (val: string | null | undefined) => (val && val.trim() !== "") ? val : null;

    // Update product
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        name,
        sku: nullIfEmpty(sku),
        designer_id: nullIfEmpty(designer_id),
        description: nullIfEmpty(description),
        price_per_rental,
        size: nullIfEmpty(size),
        color: nullIfEmpty(color),
        category: nullIfEmpty(category),
        condition: nullIfEmpty(condition),
        era: nullIfEmpty(era),
        material: nullIfEmpty(material),
        style: style || 'unisex',
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

        // Regenerate AI description when images change
        // Fetch designer name for better classification context
        let designerName: string | undefined;
        if (designer_id) {
          const { data: designer } = await supabase
            .from("designers")
            .select("name")
            .eq("id", designer_id)
            .single();
          designerName = designer?.name;
        }

        // Build metadata for better classification
        const productMetadata = {
          era: era || undefined,
          designer: designerName,
          category: category || undefined,
          color: color || undefined,
          material: material || undefined,
        };

        generateProductAIDescription(params.id, description, mediaUrls, productMetadata).catch((err) => {
          console.error("Background AI description generation failed:", err);
        });
      }
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("Product update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

    // Use admin client to bypass RLS for deletion
    const supabase = createAdminClient();

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
