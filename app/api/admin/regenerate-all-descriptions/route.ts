import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { generateProductAIDescription } from "@/lib/ai/generate-description";

export async function POST() {
  try {
    await requireAdmin();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Fetch all non-archived products with their media and designer
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        era,
        color,
        material,
        category,
        designer:designers(name),
        media:product_media(url, sort_order)
      `)
      .eq("archive", false)
      .order("created_at", { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products to regenerate",
        total: 0,
        processed: 0,
      });
    }

    console.log(`Starting batch regeneration for ${products.length} products...`);

    let processed = 0;
    let failed = 0;
    const errors: { productId: string; name: string; error: string }[] = [];

    // Process products sequentially to avoid rate limits
    for (const product of products) {
      const mediaUrls = (product.media as { url: string; sort_order: number }[])
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map((m) => m.url) || [];

      if (mediaUrls.length === 0) {
        console.log(`Skipping ${product.name} - no images`);
        continue;
      }

      try {
        const productMetadata = {
          era: product.era || undefined,
          designer: (product.designer as { name: string } | null)?.name || undefined,
          category: product.category || undefined,
          color: product.color || undefined,
          material: product.material || undefined,
        };

        console.log(`Regenerating: ${product.name}...`);

        await generateProductAIDescription(
          product.id,
          product.description,
          mediaUrls,
          productMetadata
        );

        processed++;
        console.log(`✓ ${product.name} (${processed}/${products.length})`);

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        failed++;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        errors.push({ productId: product.id, name: product.name, error: errorMessage });
        console.error(`✗ ${product.name}: ${errorMessage}`);
      }
    }

    console.log(`Batch regeneration complete: ${processed} succeeded, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Regenerated ${processed} of ${products.length} products`,
      total: products.length,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error("Batch regeneration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to regenerate descriptions";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
