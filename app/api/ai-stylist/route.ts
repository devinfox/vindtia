import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FASHION_KNOWLEDGE, getFashionContext } from "@/lib/ai/fashion-knowledge";

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

// Filter options matching ProductFilters.tsx and ProductForm.tsx
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
  exclude_colors?: string[];
  exclude_vibes?: string[];
  style_vibe?: string;
  occasion_context?: string;
};

// Build comprehensive system prompt with fashion knowledge
function buildSystemPrompt(queryContext: string): string {
  // Create decade summaries from our knowledge base
  const decadeSummaries = Object.entries(FASHION_KNOWLEDGE.decades).map(([key, decade]) => {
    return `**${key.toUpperCase()}**: ${decade.summary} Key pieces: ${decade.keyPieces.slice(0, 5).join(", ")}. Designers: ${decade.designers.join(", ")}.`;
  }).join("\n");

  // Create subculture summaries
  const subcultureSummaries = Object.entries(FASHION_KNOWLEDGE.subcultures).map(([key, sub]) => {
    return `**${key}**: ${sub.ethos}. Peak: ${sub.peakEra}. Key pieces: ${sub.keyPieces.slice(0, 4).join(", ")}. Colors: ${sub.colors.join(", ")}. NOT: ${sub.notThisStyle.join(", ")}.`;
  }).join("\n");

  // Create designer associations
  const designerSummaries = Object.entries(FASHION_KNOWLEDGE.designerAssociations).map(([designer, vibes]) => {
    return `**${designer}**: ${vibes.join(", ")}`;
  }).join("\n");

  return `You are the AI Stylist for Vindtia, a luxury vintage fashion rental platform. Your users are primarily young, fashion-forward Gen Z women who speak in vibes, references, and aesthetics.

You have DEEP KNOWLEDGE of fashion history from academic sources. Use this expertise to make perfect matches.

TAKE A MOMENT TO DEEPLY UNDERSTAND what they're really asking for. Think about:
1. The VIBE they want - not just literal items
2. Pop culture references they might be making
3. The OCCASION or context (even if not stated)
4. Current aesthetic trends they're channeling
5. The HISTORICAL CONTEXT of what they're referencing

## YOUR FASHION HISTORY KNOWLEDGE BASE:

### DECADE-BY-DECADE FASHION (use for era matching):
${decadeSummaries}

### SUBCULTURE DEEP DIVES (use for aesthetic matching):
${subcultureSummaries}

### DESIGNER DNA (match designers to aesthetics):
${designerSummaries}

### REVIVAL RULES (understand how styles return):
- ${FASHION_KNOWLEDGE.matchingRules.eraAccuracy}
- ${FASHION_KNOWLEDGE.matchingRules.authenticitySignals}
- ${FASHION_KNOWLEDGE.matchingRules.subcultureCrossover}
- ${FASHION_KNOWLEDGE.matchingRules.designerAlignment}

${queryContext ? `\n### SPECIFIC CONTEXT FOR THIS QUERY:\n${queryContext}\n` : ''}

## YOUR KNOWLEDGE BASE:

### Gen Z Fashion Aesthetics (know these deeply):
- **Old Money**: Ralph Lauren vibes, quiet luxury, tennis clubs, Nantucket, cashmere, camel coats, loafers, pearls, understated elegance
- **Quiet Luxury**: Loro Piana, The Row, no logos, muted tones, exceptional fabrics, "if you know you know"
- **Mob Wife**: Soprano-era glamour, fur coats, animal prints, gold jewelry, red lips, dramatic, leopard, power
- **Clean Girl**: Minimal, fresh, Hailey Bieber, slicked back hair, neutral tones, glazed skin aesthetic
- **Coquette**: Bows, pink, feminine, lace, ballet flats, delicate, soft, ribbons, romantic
- **Coastal Grandmother**: Nancy Meyers films, linen, cream, beige, relaxed elegance, Diane Keaton
- **It Girl**: Effortlessly cool, fashion week front row, editorial, statement pieces
- **Dark Feminine**: Mysterious, powerful, black, lace, corsets, vampy, seductive
- **Indie Sleaze**: 2000s-2010s revival, skinny scarves, band tees, messy glam, Alexa Chung, The Strokes era
- **Cottagecore**: Prairie dresses, florals, romantic, pastoral, vintage feminine
- **Y2K**: Early 2000s, low rise, butterfly clips, Paris Hilton, bedazzled, baby tees
- **Grunge**: 90s Seattle, flannel, Doc Martens, Kurt Cobain, distressed, leather, plaid
- **Bohemian/Boho**: Free-spirited, Stevie Nicks, flowing fabrics, fringe, earthy tones

### Pop Culture & Celebrity References:
- "Penny Lane" = 70s groupie glamour, Almost Famous, fur/velvet coats, bohemian romantic
- "Carrie Bradshaw" = SATC, eclectic high fashion, tulle, statement pieces, Manolos
- "Edie Sedgwick" = 60s mod, Factory Girl, mini dresses, tights, dramatic eyes
- "Bianca Jagger" = Studio 54, white suits, 70s disco glamour, powerful feminine
- "Kate Moss 90s" = minimalist, slip dresses, leather jackets, effortless cool
- "Princess Diana" = 80s elegance, power shoulders, revenge dress, athleisure chic
- "Stevie Nicks" = Witchy, flowing, velvet, platform boots, mystical bohemian
- "Cher (Clueless)" = 90s preppy, plaid, matching sets, Beverly Hills
- "Sophia Loren/Fellini era" = Italian glamour, 60s Mediterranean elegance
- "Audrey Hepburn" = Classic elegance, Breakfast at Tiffany's, little black dress, pearls
- "Alexa Chung" = British cool girl, indie, vintage mixing, effortless
- "Rihanna" = Bold, risk-taking, editorial, statement fashion
- "Bella Hadid" = Model off-duty, vintage obsessed, 90s supermodel revival

### Event/Occasion Decoding:
- "gallery opening" = artistic, intellectual, black + one statement piece, effortlessly cultured
- "date night" = romantic but not trying too hard, confident, memorable
- "girls night" = fun, photogenic, slightly daring, conversation starter
- "wedding guest" = elegant but won't upstage bride, appropriate drama
- "meeting his parents" = polished, tasteful, approachable elegance
- "job interview (creative field)" = personality but professional, shows taste
- "festival" = bohemian, comfortable but stylish, standout pieces
- "vacation" = effortlessly chic, versatile, photograph well
- "birthday dinner" = main character energy, celebratory, special

### Gen Z Language Decoder:
- "giving" = has the essence of, reminds me of
- "slay" = absolutely perfect, stunning
- "ate" = did an amazing job, killed it
- "mother" = iconic, legendary status
- "serve" = deliver a look perfectly
- "it's giving..." = it has the vibe of...
- "main character" = standout, protagonist energy
- "pick me up from the airport" = impressive, worth showing off
- "soft launch" = subtle, understated debut
- "hard launch" = bold, unmissable statement
- "understated" = quiet confidence, not trying too hard
- "that girl" = aspirational, put-together aesthetic
- "very demure, very mindful" = restrained elegance, tasteful

## OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "categories": [], // from: ${VALID_CATEGORIES.join(", ")}
  "colors": [], // from: ${VALID_COLORS.join(", ")}
  "eras": [], // from: ${VALID_ERAS.join(", ")} - ALWAYS use full format like "1970s"
  "materials": [], // from: ${VALID_MATERIALS.join(", ")}
  "keywords": [], // aesthetic/style keywords for text matching (what TO look for)
  "exclude_keywords": [], // keywords that would DISQUALIFY a piece (what to AVOID)
  "exclude_colors": [], // colors that don't fit this vibe at all
  "exclude_vibes": [], // aesthetic descriptors that are the OPPOSITE of what they want
  "style_vibe": "", // A SHORT, evocative description that shows you GET IT (speak their language back to them)
  "occasion_context": "" // What you think they might be dressing for (if inferrable)
}

IMPORTANT: The exclude fields are CRITICAL for good results. Think about what would be WRONG for this vibe:
- "1970s hippie" should EXCLUDE: sparkly, sequin, club, bodycon, neon, y2k, 90s, 2000s
- "quiet luxury" should EXCLUDE: logo, flashy, sparkly, neon, bold prints, cheap
- "mob wife" should EXCLUDE: minimalist, understated, casual, athleisure, preppy

## EXAMPLES:

User: "mob wife era"
{
  "categories": ["jackets", "accessories", "dresses"],
  "colors": ["black", "red", "gold", "brown"],
  "eras": ["1990s", "2000s"],
  "materials": ["leather", "velvet", "silk"],
  "keywords": ["fur", "leopard", "glamorous", "dramatic", "powerful", "soprano"],
  "exclude_keywords": ["minimalist", "understated", "casual", "athletic", "preppy", "boho"],
  "exclude_colors": ["pastel", "beige"],
  "exclude_vibes": ["quiet luxury", "clean girl", "cottagecore"],
  "style_vibe": "Tony's wife at the country club. Unapologetically extra, dripping in gold, fur that makes a statement before you do.",
  "occasion_context": "Making an entrance"
}

User: "1970s hippie"
{
  "categories": ["dresses", "tops", "bottoms", "accessories"],
  "colors": ["brown", "beige", "green"],
  "eras": ["1970s"],
  "materials": ["cotton", "linen", "leather", "denim", "velvet"],
  "keywords": ["bohemian", "flowing", "earthy", "fringe", "suede", "bell bottom", "woodstock", "peace"],
  "exclude_keywords": ["sparkly", "sequin", "bodycon", "club", "party", "glam", "fitted", "mini", "neon", "y2k"],
  "exclude_colors": ["pink", "silver", "neon"],
  "exclude_vibes": ["club", "party", "y2k", "glam", "sexy", "90s minimalist"],
  "style_vibe": "Living your best Woodstock fantasy with flowing fabrics, earthy tones, and a free-spirited vibe. Peace, love, and vintage charm.",
  "occasion_context": "Festival / outdoor gathering / channeling carefree vibes"
}

User: "something for a gallery opening but make it interesting"
{
  "categories": ["dresses", "tops", "jackets"],
  "colors": ["black", "white", "navy"],
  "eras": ["1990s", "1960s", "Contemporary"],
  "materials": ["silk", "velvet", "wool"],
  "keywords": ["architectural", "minimal", "artistic", "editorial", "intellectual"],
  "exclude_keywords": ["sparkly", "casual", "sporty", "boho", "frilly"],
  "exclude_colors": ["neon", "bright pink"],
  "exclude_vibes": ["party girl", "casual", "athleisure"],
  "style_vibe": "You understand Basquiat AND Balenciaga. Black base, one piece that starts conversations with the right people.",
  "occasion_context": "Gallery opening / art event"
}

User: "giving penny lane"
{
  "categories": ["jackets"],
  "colors": ["brown", "beige", "white"],
  "eras": ["1970s"],
  "materials": ["velvet", "leather", "silk"],
  "keywords": ["bohemian", "groupie", "romantic", "rock", "vintage", "shearling", "fur trim"],
  "exclude_keywords": ["minimal", "structured", "corporate", "sporty", "sparkly"],
  "exclude_colors": ["neon", "black"],
  "exclude_vibes": ["office", "minimalist", "y2k"],
  "style_vibe": "Band Aid energy. The coat that gets you backstage and makes everyone ask where you got it. 70s dreamgirl.",
  "occasion_context": "Concert / music event / wanting to feel iconic"
}

User: "quiet luxury but vintage"
{
  "categories": ["tops", "jackets", "accessories"],
  "colors": ["beige", "brown", "white", "navy"],
  "eras": ["1990s", "1980s"],
  "materials": ["cashmere", "silk", "wool"],
  "keywords": ["minimal", "elegant", "understated", "quality", "timeless", "refined"],
  "exclude_keywords": ["logo", "flashy", "sparkly", "bold", "loud", "trendy", "cheap"],
  "exclude_colors": ["neon", "bright pink", "gold"],
  "exclude_vibes": ["maximalist", "glam", "party", "y2k"],
  "style_vibe": "The Row before The Row existed. Pieces so good you don't need a logo. Old money whispers.",
  "occasion_context": "Elevated everyday / wanting to look expensive without trying"
}

User: "y2k going out top"
{
  "categories": ["tops"],
  "colors": ["pink", "silver", "white", "black"],
  "eras": ["2000s"],
  "materials": ["silk", "satin", "polyester"],
  "keywords": ["going out", "halter", "sparkly", "party", "sexy", "paris hilton"],
  "exclude_keywords": ["modest", "conservative", "bohemian", "earthy", "natural"],
  "exclude_colors": ["brown", "olive", "rust"],
  "exclude_vibes": ["hippie", "cottage core", "quiet luxury"],
  "style_vibe": "It's 2003, you're on the list, and the flash photography will be iconic. That's hot.",
  "occasion_context": "Night out / party"
}

REMEMBER: These girls are fashion-literate. They know their references. Show them you understand the assignment.

USE YOUR FASHION HISTORY KNOWLEDGE to make matches that feel authentic and knowledgeable. If someone asks for "70s hippie," you should know that means flowing silhouettes, earth tones, natural materials, and a free-spirited ethos - and that a sleek 90s minimalist piece would NOT fit even if it's brown.`;
}



export async function POST(req: Request) {
  try {
    const { query, userTier = 0, userStylePreference } = await req.json();

    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a more detailed description" },
        { status: 400 }
      );
    }

    console.log("AI Stylist query:", query, "userTier:", userTier, "stylePreference:", userStylePreference);

    // Get fashion context for this specific query
    const fashionContext = getFashionContext(query);
    console.log("Fashion context found:", fashionContext ? "Yes" : "No");

    // Build the system prompt with fashion knowledge + query-specific context
    const systemPrompt = buildSystemPrompt(fashionContext);

    // Step 1: Parse the natural language query into structured filters
    // Using GPT-4o for deeper understanding of Gen Z fashion language
    const filterResponse = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: query }
      ],
      max_tokens: 500,
      temperature: 0.7, // Slightly higher for more creative/natural style_vibe responses
    });

    let parsedFilters: ParsedFilters = {};
    try {
      const content = filterResponse.choices[0]?.message?.content || "{}";
      console.log("GPT filter response:", content);
      parsedFilters = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      console.log("Parsed filters:", parsedFilters);
    } catch (e) {
      console.error("Failed to parse filter response:", e);
    }

    const supabase = await createClient();

    // Step 2: Fetch ALL non-archived products and score them
    // Using scoring instead of strict AND filtering for better results
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
    // Only show products that match the user's style preference
    if (userStylePreference && Array.isArray(userStylePreference) && userStylePreference.length > 0) {
      // User can see: their preferred styles + unisex items
      const stylesToShow = [...userStylePreference, 'unisex'];
      productsQuery = productsQuery.in('style', stylesToShow);
      console.log("Filtering by styles:", stylesToShow);
    }

    const { data: allProducts, error: fetchError } = await productsQuery.limit(200);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
    }

    console.log("Total products fetched:", allProducts?.length || 0);

    // Step 3: Score each product based on how well it matches the parsed filters
    // ERA is a HARD FILTER when specified - we only show items from that era
    const hasEraFilter = parsedFilters.eras && parsedFilters.eras.length > 0;

    const scoredProducts = (allProducts || []).map((product: any) => {
      let score = 0;
      const matchReasons: string[] = [];
      let eraMatched = false;

      // Era match - CHECK FIRST (this is a hard filter)
      if (hasEraFilter) {
        if (product.era) {
          for (const era of parsedFilters.eras!) {
            // Match full era or partial (e.g., "1970s" matches "1970s" or "70s" in product name/era)
            const decadeNum = era.replace(/\D/g, '').slice(-2); // "1970s" -> "70"
            const productText = `${product.era || ''} ${product.name || ''}`.toLowerCase();
            if (product.era === era || productText.includes(decadeNum + "s") || productText.includes("'" + decadeNum) || productText.includes(decadeNum + "'")) {
              eraMatched = true;
              score += 50; // High score for era match
              matchReasons.push(`era:${product.era}`);
              break;
            }
          }
        }
        // If era was specified but product doesn't match, skip this product entirely
        if (!eraMatched) {
          return { ...product, _score: 0, _matchReasons: [], _excluded: true };
        }
      }

      // Category match - 30 points
      if (parsedFilters.categories && parsedFilters.categories.length > 0) {
        if (product.category && parsedFilters.categories.includes(product.category.toLowerCase())) {
          score += 30;
          matchReasons.push(`category:${product.category}`);
        }
      }

      // Color match - 20 points
      if (parsedFilters.colors && parsedFilters.colors.length > 0) {
        if (product.color && parsedFilters.colors.includes(product.color.toLowerCase())) {
          score += 20;
          matchReasons.push(`color:${product.color}`);
        }
      }

      // Material match - 20 points
      if (parsedFilters.materials && parsedFilters.materials.length > 0) {
        if (product.material && parsedFilters.materials.includes(product.material.toLowerCase())) {
          score += 20;
          matchReasons.push(`material:${product.material}`);
        }
      }

      // Keyword matching in name/description/ai_description - 10 points each
      const searchText = `${product.name || ''} ${product.description || ''} ${product.ai_description || ''}`.toLowerCase();

      if (parsedFilters.keywords && parsedFilters.keywords.length > 0) {
        for (const keyword of parsedFilters.keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            score += 10;
            matchReasons.push(`keyword:${keyword}`);
          }
        }
      }

      // EXCLUSION CHECKS - heavily penalize or exclude items that don't fit the vibe
      let excluded = false;

      // Check for excluded keywords (things that are the OPPOSITE of what they want)
      if (parsedFilters.exclude_keywords && parsedFilters.exclude_keywords.length > 0) {
        for (const excludeWord of parsedFilters.exclude_keywords) {
          if (searchText.includes(excludeWord.toLowerCase())) {
            // If a product matches an exclude keyword, heavily penalize it
            score -= 40;
            matchReasons.push(`EXCLUDE:${excludeWord}`);
          }
        }
      }

      // Check for excluded colors
      if (parsedFilters.exclude_colors && parsedFilters.exclude_colors.length > 0) {
        const productColor = (product.color || '').toLowerCase();
        for (const excludeColor of parsedFilters.exclude_colors) {
          if (productColor.includes(excludeColor.toLowerCase()) || searchText.includes(excludeColor.toLowerCase())) {
            score -= 30;
            matchReasons.push(`EXCLUDE_COLOR:${excludeColor}`);
          }
        }
      }

      // Check for excluded vibes in description/ai_description
      if (parsedFilters.exclude_vibes && parsedFilters.exclude_vibes.length > 0) {
        for (const excludeVibe of parsedFilters.exclude_vibes) {
          if (searchText.includes(excludeVibe.toLowerCase())) {
            score -= 35;
            matchReasons.push(`EXCLUDE_VIBE:${excludeVibe}`);
          }
        }
      }

      // If score went negative, mark as excluded
      if (score <= 0) {
        excluded = true;
      }

      return { ...product, _score: score, _matchReasons: matchReasons, _excluded: excluded };
    });

    // Filter out excluded products and those with no match, then sort by score
    const matchedProducts = scoredProducts
      .filter((p: any) => p._score > 0 && !p._excluded)
      .sort((a: any, b: any) => b._score - a._score);

    console.log("Matched products count:", matchedProducts.length);
    if (matchedProducts.length > 0) {
      console.log("Top match:", matchedProducts[0].name, "score:", matchedProducts[0]._score, "reasons:", matchedProducts[0]._matchReasons);
    }

    // Take top candidates for GPT review
    const candidateProducts = matchedProducts.slice(0, 30);

    // Step 4: Have GPT review the candidates and filter out ones that don't actually fit the vibe
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
          style: p.style || "unisex", // masculine, feminine, or unisex
          description: (p.ai_description || p.description || "").slice(0, 150),
        }));

        // Build context for review with fashion knowledge
        const reviewContext = fashionContext ? `\n\nFASHION KNOWLEDGE FOR THIS SEARCH:\n${fashionContext}` : '';

        // Build style preference context
        let styleContext = '';
        if (userStylePreference && Array.isArray(userStylePreference) && userStylePreference.length > 0) {
          const styleStr = userStylePreference.join(' and ');
          styleContext = `\n\n⚠️ IMPORTANT - USER STYLE PREFERENCE: This user prefers ${styleStr} styles. Include products that match ${styleStr} presentation. Do NOT exclude items just because they are ${styleStr}-presenting.`;
        }

        // Check if this is a simple brand/designer search
        const isBrandSearch = /^[a-zA-Z\s]+$/.test(query.trim()) && query.trim().split(/\s+/).length <= 3;

        // Check if this is a multi-item search (e.g., "skirt and heels", "dress with jacket")
        const multiItemPatterns = /\b(and|with|plus|&|\+|,)\b/i;
        const itemTypeWords = /\b(skirt|heels|shoes|dress|jacket|top|pants|bottoms|bag|accessory|accessories|coat|shirt|blouse)\b/i;
        const queryLower = query.toLowerCase();
        const hasMultipleItemTypes = (queryLower.match(itemTypeWords) || []).length >= 2;
        const isMultiItemSearch = (multiItemPatterns.test(query) && (parsedFilters.categories && parsedFilters.categories.length > 1)) || hasMultipleItemTypes;

        console.log("Search type detection:", { isBrandSearch, isMultiItemSearch, hasMultipleItemTypes, categories: parsedFilters.categories });

        const reviewResponse = await getOpenAI().chat.completions.create({
          model: "gpt-4o-mini", // Use mini for cost efficiency on this step
          messages: [
            {
              role: "system",
              content: `You are a fashion expert curator with deep historical knowledge. The user searched for: "${query}"
${reviewContext}${styleContext}

Your job is to review these candidate products and ONLY return the IDs of products that ACTUALLY fit what they're looking for.

${isBrandSearch ? `NOTE: This appears to be a BRAND/DESIGNER search. Be INCLUSIVE - include ALL products from this designer/brand, regardless of style (masculine, feminine, or unisex). The user wants to see what's available from this brand.` : isMultiItemSearch ? `NOTE: This is a MULTI-ITEM search. The user wants MULTIPLE types of items (e.g., both skirts AND heels). Be INCLUSIVE for each category mentioned - include items from ALL requested categories. The user wants variety across different item types, not just one type.` : `Think critically using your fashion history knowledge:
- Does this product's era, designer, style actually match what they want?
- Would a fashion-literate person see this product and think "yes, that's exactly the vibe"?
- Be STRICT - it's better to return fewer perfect matches than many mediocre ones
- A 1990s Versace shirt is NOT "1970s hippie" even if it has some bohemian patterns
- A pink sparkly dress is NOT "quiet luxury" even if it's expensive
- Consider the WHOLE picture: designer reputation, era accuracy, aesthetic alignment
- Use your knowledge of subculture ethos and key pieces to validate matches`}

Return ONLY a JSON array of product IDs that truly fit, in order of best match first.
Example: ["id1", "id2", "id3"]

If NONE of the products fit well, return an empty array: []`
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
            // Reorder products based on GPT's ranking
            const approvedProducts = approvedIds
              .map(id => candidateProducts.find((p: any) => p.id === id))
              .filter(Boolean);

            rankedProducts = approvedProducts;
            console.log("GPT approved products:", approvedProducts.length);
          } else {
            // GPT said none fit - return empty or keep top few with warning
            console.log("GPT approved no products");
            rankedProducts = [];
          }
        } catch (parseError) {
          console.error("Failed to parse GPT review:", parseError);
          // Fall back to original scoring
          rankedProducts = candidateProducts.slice(0, 20);
        }
      } catch (reviewError) {
        console.error("GPT review failed:", reviewError);
        // Fall back to original scoring
        rankedProducts = candidateProducts.slice(0, 20);
      }
    }

    // Final slice to top 20
    rankedProducts = rankedProducts.slice(0, 20);

    return NextResponse.json({
      products: rankedProducts,
      interpretation: parsedFilters.style_vibe || null,
      occasion: parsedFilters.occasion_context || null,
      filters_applied: {
        categories: parsedFilters.categories || [],
        colors: parsedFilters.colors || [],
        eras: parsedFilters.eras || [],
        materials: parsedFilters.materials || [],
        keywords: parsedFilters.keywords || [],
      },
      result_count: rankedProducts.length,
      debug: {
        query,
        parsedFilters,
        totalProductsScored: allProducts?.length || 0,
        matchedProductsCount: matchedProducts.length,
      }
    });

  } catch (error: unknown) {
    console.error("AI Stylist error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
