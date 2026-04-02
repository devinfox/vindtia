import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { generateProductAIDescription } from "@/lib/ai/generate-description";

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

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
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

      // Automatically generate AI description in the background
      // This runs after the response is sent so it doesn't block the admin
      if (process.env.OPENAI_API_KEY) {
        console.log(`Starting AI description generation for product ${product.id}...`);

        // Fetch designer name for better context
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

        generateProductAIDescription(product.id, description, mediaUrls, productMetadata)
          .then(() => {
            console.log(`AI description generated successfully for product ${product.id}`);
          })
          .catch((err) => {
            console.error("Background AI description generation failed:", err);
          });
      } else {
        console.warn("OPENAI_API_KEY not configured - skipping AI description generation");
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Product creation error:", error);
    // Log full error details for debugging
    if (error && typeof error === 'object') {
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
    const errorMessage = error instanceof Error
      ? error.message
      : (error && typeof error === 'object' && 'message' in error)
        ? String((error as { message: unknown }).message)
        : "Failed to create product";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
