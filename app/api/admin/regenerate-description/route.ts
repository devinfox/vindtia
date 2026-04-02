import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { generateProductAIDescription } from "@/lib/ai/generate-description";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured in environment variables" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Fetch the product with its description, media, and metadata for classification
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(`
        id,
        description,
        era,
        color,
        material,
        category,
        designer:designers(name),
        media:product_media(url, sort_order)
      `)
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const mediaUrls = (product.media as { url: string; sort_order: number }[])
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => m.url) || [];

    if (mediaUrls.length === 0) {
      return NextResponse.json(
        { error: "Product has no images. Upload images first." },
        { status: 400 }
      );
    }

    // Extract product metadata for better classification
    const productMetadata = {
      era: product.era || undefined,
      designer: (product.designer as { name: string } | null)?.name || undefined,
      category: product.category || undefined,
      color: product.color || undefined,
      material: product.material || undefined,
    };

    // Generate AI description with full context
    await generateProductAIDescription(
      product.id,
      product.description,
      mediaUrls,
      productMetadata
    );

    // Fetch the updated product
    const { data: updatedProduct } = await supabase
      .from("products")
      .select("ai_description, ai_description_generated_at")
      .eq("id", productId)
      .single();

    return NextResponse.json({
      success: true,
      ai_description: updatedProduct?.ai_description,
      generated_at: updatedProduct?.ai_description_generated_at,
    });
  } catch (error: unknown) {
    console.error("AI regeneration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate description";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
