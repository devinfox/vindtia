import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FASHION_KNOWLEDGE, getFashionContext } from "@/lib/ai/fashion-knowledge";

// Lazy initialization
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Build fashion knowledge for analysis
function buildFashionKnowledge(): string {
  const subcultures = Object.entries(FASHION_KNOWLEDGE.subcultures).map(([key, sub]) => {
    return `**${key}**: ${sub.ethos}. Era: ${sub.peakEra}. Key pieces: ${sub.keyPieces.slice(0, 3).join(", ")}. Colors: ${sub.colors.join(", ")}.`;
  }).join("\n");

  const decades = Object.entries(FASHION_KNOWLEDGE.decades).map(([key, decade]) => {
    return `**${key}**: ${decade.summary}`;
  }).join("\n");

  return `SUBCULTURES:\n${subcultures}\n\nDECADES:\n${decades}`;
}

const VALID_CATEGORIES = ["tops", "jackets", "bottoms", "shoes", "dresses", "accessories"];
const VALID_COLORS = ["black", "white", "red", "blue", "green", "brown", "beige", "gold", "silver", "pink", "purple", "navy"];
const VALID_ERAS = ["1920s", "1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "Contemporary"];
const VALID_MATERIALS = ["silk", "cashmere", "wool", "cotton", "linen", "leather", "velvet", "satin", "lace", "denim", "polyester", "mixed"];

type ParsedFilters = {
  categories?: string[];
  colors?: string[];
  eras?: string[];
  materials?: string[];
  keywords?: string[];
  exclude_keywords?: string[];
  style_vibe?: string;
  outfit_breakdown?: string;
};

export async function POST(req: Request) {
  try {
    const { imageUrl, userTier = 0, userStylePreference } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Please provide an image URL" },
        { status: 400 }
      );
    }

    console.log("AI Stylist image search, userTier:", userTier, "stylePreference:", userStylePreference);

    // Step 1: Analyze the uploaded image with GPT-4 Vision
    const analysisPrompt = `You are a fashion expert analyzing an outfit image to help find similar vintage pieces from our archive.

## YOUR FASHION KNOWLEDGE:
${buildFashionKnowledge()}

## TASK:
Analyze this outfit image and extract:
1. Each distinct clothing item/piece visible
2. The overall aesthetic/vibe/subculture it represents
3. The era it evokes
4. Colors, materials, and style details

## OUTPUT FORMAT (JSON):
{
  "categories": [], // What types of pieces are shown: ${VALID_CATEGORIES.join(", ")}
  "colors": [], // Main colors visible: ${VALID_COLORS.join(", ")}
  "eras": [], // What era(s) this evokes: ${VALID_ERAS.join(", ")}
  "materials": [], // Likely materials: ${VALID_MATERIALS.join(", ")}
  "keywords": [], // Style keywords, aesthetics, vibes (e.g., "bohemian", "grunge", "minimalist", "power dressing")
  "exclude_keywords": [], // Styles this is definitely NOT
  "style_vibe": "", // A description of the overall vibe to show the user
  "outfit_breakdown": "" // Brief description of what you see in the image (e.g., "A 70s-inspired look featuring bell bottoms, a peasant blouse, and platform heels")
}

Be thorough - identify ALL the categories of items visible. If you see pants + top + jacket, include all three in categories.
Focus on finding matches for the KEY statement pieces, not generic basics.`;

    const visionResponse = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.5,
    });

    let parsedFilters: ParsedFilters = {};
    let outfitBreakdown = "";
    let styleVibe = "";

    try {
      const content = visionResponse.choices[0]?.message?.content || "{}";
      console.log("GPT Vision response:", content);
      parsedFilters = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      outfitBreakdown = parsedFilters.outfit_breakdown || "";
      styleVibe = parsedFilters.style_vibe || "";
      console.log("Parsed filters from image:", parsedFilters);
    } catch (e) {
      console.error("Failed to parse vision response:", e);
      return NextResponse.json(
        { error: "Failed to analyze image. Please try a clearer photo." },
        { status: 400 }
      );
    }

    // Step 2: Fetch products and score them (same logic as text search)
    const supabase = await createClient();

    let productsQuery = supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        ai_description,
        price_per_rental,
        size,
        color,
        category,
        era,
        material,
        style,
        tier_required,
        designer:designers(id, name),
        media:product_media(id, url, sort_order)
      `)
      .eq("archive", false);

    // Filter by user's style preference if provided
    if (userStylePreference && Array.isArray(userStylePreference) && userStylePreference.length > 0) {
      const stylesToShow = [...userStylePreference, 'unisex'];
      productsQuery = productsQuery.in('style', stylesToShow);
      console.log("Filtering by styles:", stylesToShow);
    }

    const { data: allProducts, error: fetchError } = await productsQuery.limit(200);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
    }

    // Step 3: Score products based on image analysis
    const hasEraFilter = parsedFilters.eras && parsedFilters.eras.length > 0;
    const hasCategoryFilter = parsedFilters.categories && parsedFilters.categories.length > 0;

    const scoredProducts = (allProducts || []).map((product: any) => {
      let score = 0;
      const matchReasons: string[] = [];
      let excluded = false;

      // Category match - 40 points (higher weight for image search)
      if (hasCategoryFilter) {
        if (product.category && parsedFilters.categories!.includes(product.category.toLowerCase())) {
          score += 40;
          matchReasons.push(`category:${product.category}`);
        }
      }

      // Era match - 30 points
      if (hasEraFilter && product.era) {
        for (const era of parsedFilters.eras!) {
          const decadeNum = era.replace(/\D/g, '').slice(-2);
          const productText = `${product.era || ''} ${product.name || ''}`.toLowerCase();
          if (product.era === era || productText.includes(decadeNum + "s")) {
            score += 30;
            matchReasons.push(`era:${product.era}`);
            break;
          }
        }
      }

      // Color match - 20 points
      if (parsedFilters.colors && parsedFilters.colors.length > 0) {
        if (product.color && parsedFilters.colors.includes(product.color.toLowerCase())) {
          score += 20;
          matchReasons.push(`color:${product.color}`);
        }
      }

      // Material match - 15 points
      if (parsedFilters.materials && parsedFilters.materials.length > 0) {
        if (product.material && parsedFilters.materials.includes(product.material.toLowerCase())) {
          score += 15;
          matchReasons.push(`material:${product.material}`);
        }
      }

      // Keyword matching in ai_description - 10 points each
      const searchText = `${product.name || ''} ${product.description || ''} ${product.ai_description || ''}`.toLowerCase();

      if (parsedFilters.keywords && parsedFilters.keywords.length > 0) {
        for (const keyword of parsedFilters.keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            score += 10;
            matchReasons.push(`keyword:${keyword}`);
          }
        }
      }

      // Exclusion checks
      if (parsedFilters.exclude_keywords && parsedFilters.exclude_keywords.length > 0) {
        for (const excludeWord of parsedFilters.exclude_keywords) {
          if (searchText.includes(excludeWord.toLowerCase())) {
            score -= 30;
            matchReasons.push(`EXCLUDE:${excludeWord}`);
          }
        }
      }

      if (score <= 0) {
        excluded = true;
      }

      return { ...product, _score: score, _matchReasons: matchReasons, _excluded: excluded };
    });

    // Filter and sort
    const matchedProducts = scoredProducts
      .filter((p: any) => p._score > 0 && !p._excluded)
      .sort((a: any, b: any) => b._score - a._score);

    console.log("Matched products count:", matchedProducts.length);

    // Take top 30 for GPT review
    const candidateProducts = matchedProducts.slice(0, 30);

    // Step 4: GPT review to filter best matches
    let rankedProducts = candidateProducts;

    if (candidateProducts.length > 0) {
      try {
        const productSummaries = candidateProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          designer: p.designer?.name || "Unknown",
          era: p.era || "Unknown",
          color: p.color || "Unknown",
          material: p.material || "Unknown",
          category: p.category || "Unknown",
          style: p.style || "unisex",
          description: (p.ai_description || p.description || "").slice(0, 150),
        }));

        // Build style preference context
        let styleContext = '';
        if (userStylePreference && Array.isArray(userStylePreference) && userStylePreference.length > 0) {
          const styleStr = userStylePreference.join(' and ');
          styleContext = `\n\n⚠️ USER STYLE PREFERENCE: This user prefers ${styleStr} styles. Include products that match ${styleStr} presentation.`;
        }

        const reviewResponse = await getOpenAI().chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a fashion expert curator. The user uploaded an image with this analysis:

OUTFIT BREAKDOWN: ${outfitBreakdown}
STYLE VIBE: ${styleVibe}
CATEGORIES NEEDED: ${parsedFilters.categories?.join(", ") || "various"}${styleContext}

Your job is to select products that would help RECREATE this look or match its aesthetic.

Think about:
- Does this product's style match the vibe of the uploaded image?
- Would this piece help recreate the outfit shown?
- Consider era, aesthetic, and category matches

Return ONLY a JSON array of product IDs that would work, in order of best match first.
Example: ["id1", "id2", "id3"]

Return empty array [] if nothing fits.`
            },
            {
              role: "user",
              content: JSON.stringify(productSummaries, null, 2)
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        });

        const reviewContent = reviewResponse.choices[0]?.message?.content || "[]";
        console.log("GPT review response:", reviewContent);

        try {
          const approvedIds: string[] = JSON.parse(reviewContent.replace(/```json\n?|\n?```/g, "").trim());

          if (Array.isArray(approvedIds) && approvedIds.length > 0) {
            const approvedProducts = approvedIds
              .map(id => candidateProducts.find((p: any) => p.id === id))
              .filter(Boolean);

            rankedProducts = approvedProducts;
          } else {
            rankedProducts = [];
          }
        } catch (parseError) {
          console.error("Failed to parse GPT review:", parseError);
          rankedProducts = candidateProducts.slice(0, 20);
        }
      } catch (reviewError) {
        console.error("GPT review failed:", reviewError);
        rankedProducts = candidateProducts.slice(0, 20);
      }
    }

    // Final slice
    rankedProducts = rankedProducts.slice(0, 20);

    return NextResponse.json({
      products: rankedProducts,
      interpretation: styleVibe,
      outfit_breakdown: outfitBreakdown,
      filters_applied: {
        categories: parsedFilters.categories || [],
        colors: parsedFilters.colors || [],
        eras: parsedFilters.eras || [],
        materials: parsedFilters.materials || [],
        keywords: parsedFilters.keywords || [],
      },
      result_count: rankedProducts.length,
    });

  } catch (error: unknown) {
    console.error("AI Stylist image search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
