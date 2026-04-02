import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FASHION_KNOWLEDGE } from "@/lib/ai/fashion-knowledge";

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Build subculture reference for classification
function buildSubcultureReference(): string {
  return Object.entries(FASHION_KNOWLEDGE.subcultures).map(([key, sub]) => {
    return `**${key}**: ${sub.ethos}. Era: ${sub.peakEra}. Key pieces: ${sub.keyPieces.join(", ")}. Colors: ${sub.colors.join(", ")}. Materials: ${sub.materials.join(", ")}.`;
  }).join("\n");
}

// Build decade reference
function buildDecadeReference(): string {
  return Object.entries(FASHION_KNOWLEDGE.decades).map(([key, decade]) => {
    return `**${key}**: ${decade.summary} Key movements: ${decade.keyMovements.join(", ")}. Key pieces: ${decade.keyPieces.join(", ")}. Designers: ${decade.designers.join(", ")}.`;
  }).join("\n");
}

// Build designer associations
function buildDesignerReference(): string {
  return Object.entries(FASHION_KNOWLEDGE.designerAssociations).map(([designer, vibes]) => {
    return `**${designer}**: ${vibes.join(", ")}`;
  }).join("\n");
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!adminRole) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { productId, manualDescription, imageUrls, productMetadata } = await req.json();

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Prepare image content for GPT-4 Vision (max 4 images)
    const imageContent = imageUrls.slice(0, 4).map((url: string) => ({
      type: "image_url" as const,
      image_url: { url, detail: "high" as const }
    }));

    // System prompt focused on CLASSIFICATION for AI matching, not marketing
    const systemPrompt = `You are a fashion historian and classification specialist for Vindtia's AI styling system. Your job is to analyze vintage fashion pieces and write CLASSIFICATION DESCRIPTIONS that help our AI stylist match items to user requests.

DO NOT write marketing copy. Write technical, classification-focused descriptions that:
1. Identify which SUBCULTURES/AESTHETICS this piece belongs to or could serve
2. Tag relevant ERAS and style movements
3. Describe construction, silhouette, and materials for matching
4. Note who would search for this (what vibes, what occasions)
5. Include keywords that users might search for

## YOUR FASHION KNOWLEDGE BASE:

### SUBCULTURES (tag which ones this piece fits):
${buildSubcultureReference()}

### DECADES & MOVEMENTS (identify era influences):
${buildDecadeReference()}

### DESIGNER DNA (match designer aesthetics):
${buildDesignerReference()}

## OUTPUT FORMAT:

Write a 150-200 word description structured as:

1. **Classification tags** (first line): List the subcultures, aesthetics, and vibes this piece fits
   Example: "TAGS: quiet luxury, 90s minimalism, old money, understated elegance"

2. **Era & Movement**: What decade/movement does this represent? Be specific.

3. **Physical Description**: Silhouette, construction, materials, color palette - factual details.

4. **Styling Context**: What occasions? What aesthetic is the wearer going for? Who searches for this?

5. **Match Keywords**: End with searchable terms users might use
   Example: "Keywords: gallery opening, date night, effortless chic, Kate Moss, slip dress aesthetic"

IMPORTANT: This is for AI MATCHING, not customer display. Be technical and thorough with classification. Include subculture names, era references, and aesthetic tags that our AI stylist uses to match products to queries like "mob wife era" or "70s hippie" or "quiet luxury."`;

    // Build context from product metadata if available
    let metadataContext = "";
    if (productMetadata) {
      const parts = [];
      if (productMetadata.era) parts.push(`Era: ${productMetadata.era}`);
      if (productMetadata.designer) parts.push(`Designer: ${productMetadata.designer}`);
      if (productMetadata.category) parts.push(`Category: ${productMetadata.category}`);
      if (productMetadata.color) parts.push(`Color: ${productMetadata.color}`);
      if (productMetadata.material) parts.push(`Material: ${productMetadata.material}`);
      if (parts.length > 0) {
        metadataContext = `\n\nProduct metadata: ${parts.join(", ")}`;
      }
    }

    const userPrompt = manualDescription
      ? `Curator notes: "${manualDescription}"${metadataContext}

Analyze the images and create a CLASSIFICATION DESCRIPTION for our AI stylist. Identify all relevant subcultures, eras, aesthetics, and matching keywords. Focus on what style searches this would match.`
      : `${metadataContext ? `Product metadata: ${metadataContext.trim()}` : ""}

Analyze these vintage fashion images and create a CLASSIFICATION DESCRIPTION for our AI stylist. Identify subcultures, eras, aesthetics, and all relevant matching keywords. Be thorough with classification tags.`;

    // Call GPT-4 Vision
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            ...imageContent
          ]
        }
      ],
      max_tokens: 600,
      temperature: 0.5, // Lower temperature for more consistent classification
    });

    const aiDescription = response.choices[0]?.message?.content;

    if (!aiDescription) {
      throw new Error("Failed to generate description");
    }

    // Generate embedding for the description (for semantic search)
    const embeddingResponse = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: aiDescription,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // If productId is provided, update the product in database
    if (productId) {
      const { error } = await supabase
        .from("products")
        .update({
          ai_description: aiDescription,
          ai_description_generated_at: new Date().toISOString(),
          description_embedding: embedding,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (error) {
        console.error("Database update error:", error);
        // Still return the description even if DB update fails
      }
    }

    return NextResponse.json({
      ai_description: aiDescription,
      embedding: embedding,
      success: true
    });

  } catch (error: unknown) {
    console.error("AI description generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate description";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
