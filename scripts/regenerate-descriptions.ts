/**
 * Script to regenerate all AI descriptions with the new fashion knowledge base
 * Run with: npx tsx scripts/regenerate-descriptions.ts
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE environment variables");
  process.exit(1);
}

if (!openaiKey) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiKey });

// Fashion knowledge (inline for script)
const FASHION_KNOWLEDGE = {
  subcultures: {
    mods: { ethos: "Modernist 'cool,' scene status, attention to detail", peakEra: "1960s", keyPieces: ["tailored suits", "parkas", "Chelsea boots", "turtlenecks"], colors: ["navy", "black", "white", "burgundy"], materials: ["wool", "cotton", "leather"] },
    hippies: { ethos: "Anti-war, anti-establishment, peace and love", peakEra: "Late 1960s–1970s", keyPieces: ["bell bottoms", "fringe vests", "maxi dresses", "peasant blouses"], colors: ["earth tones", "brown", "orange", "rust", "cream"], materials: ["cotton", "linen", "suede", "denim", "crochet"] },
    punk: { ethos: "Anti-establishment, DIY, shock value, rebellion", peakEra: "Late 1970s", keyPieces: ["leather jackets", "ripped tees", "safety pins", "tartan", "combat boots"], colors: ["black", "red", "tartan patterns"], materials: ["leather", "denim", "cotton", "vinyl"] },
    newRomantic: { ethos: "Artifice, glamour, spectacle, gender play", peakEra: "Early to mid 1980s", keyPieces: ["ruffled shirts", "dramatic silhouettes", "theatrical makeup", "capes"], colors: ["jewel tones", "purple", "gold", "black"], materials: ["velvet", "silk", "lace", "satin"] },
    goth: { ethos: "Romantic nihilism, outsider identity, beauty in darkness", peakEra: "1980s onward", keyPieces: ["black everything", "Victorian details", "corsets", "platform boots"], colors: ["black", "deep purple", "burgundy", "silver"], materials: ["velvet", "lace", "leather", "PVC"] },
    grunge: { ethos: "Anti-fashion authenticity, rejection of mainstream glamour", peakEra: "Early–mid 1990s", keyPieces: ["flannel shirts", "oversized band tees", "Doc Martens", "ripped jeans"], colors: ["dark", "muted", "earth tones", "black", "navy"], materials: ["cotton", "flannel", "denim", "leather"] },
    y2k: { ethos: "Playful excess; irony in revival; celebrity aspiration", peakEra: "2000s", keyPieces: ["low-rise jeans", "butterfly clips", "mini skirts", "halter tops", "rhinestones"], colors: ["pink", "baby blue", "silver", "white"], materials: ["synthetic", "denim", "rhinestones", "metallic"] },
    cottagecore: { ethos: "Escapism, 'slow' ideals, romanticized rural life", peakEra: "2020s", keyPieces: ["prairie dresses", "puff sleeves", "straw hats", "aprons"], colors: ["cream", "sage green", "dusty rose", "brown"], materials: ["cotton", "linen", "eyelet", "gingham"] },
  },
  decades: {
    sixties: { summary: "Youth rebellion, mod minimalism, space-age looks", keyPieces: ["mini skirts", "shift dresses", "go-go boots"], designers: ["Mary Quant", "André Courrèges", "Pierre Cardin"] },
    seventies: { summary: "Punk emerges, disco glamour, hippie continuation", keyPieces: ["bell bottoms", "platform shoes", "leather jackets", "fringe"], designers: ["Vivienne Westwood", "Halston", "Diane von Furstenberg"] },
    eighties: { summary: "Power dressing, New Romantic theatricality, hip-hop emerges", keyPieces: ["power shoulders", "bold colors", "gold jewelry", "tracksuits"], designers: ["Giorgio Armani", "Thierry Mugler", "Claude Montana"] },
    nineties: { summary: "Grunge, minimalism, Riot Grrrl, supermodel era", keyPieces: ["flannel shirts", "slip dresses", "chokers", "platform shoes"], designers: ["Marc Jacobs", "Calvin Klein", "Helmut Lang"] },
    twoThousands: { summary: "Y2K aesthetic, hip-hop glamour, indie sleaze", keyPieces: ["low-rise everything", "velour tracksuits", "logo mania", "statement sunglasses"], designers: ["Alexander McQueen", "John Galliano", "Tom Ford"] },
  },
  designerAssociations: {
    versace: ["bold", "glamorous", "baroque", "gold", "powerful", "maximalist"],
    armani: ["quiet luxury", "understated", "tailored", "neutral", "elegant"],
    valentino: ["romantic", "red", "couture", "feminine", "elegant"],
    prada: ["intellectual", "subversive", "nylon", "minimal", "conceptual"],
    chanel: ["classic", "tweed", "pearls", "Parisian", "timeless"],
    vivienneWestwood: ["punk", "British", "rebellious", "corsets", "tartan"],
  }
};

function buildSubcultureReference(): string {
  return Object.entries(FASHION_KNOWLEDGE.subcultures).map(([key, sub]) => {
    return `**${key}**: ${sub.ethos}. Era: ${sub.peakEra}. Key pieces: ${sub.keyPieces.join(", ")}. Colors: ${sub.colors.join(", ")}. Materials: ${sub.materials.join(", ")}.`;
  }).join("\n");
}

function buildDecadeReference(): string {
  return Object.entries(FASHION_KNOWLEDGE.decades).map(([key, decade]) => {
    return `**${key}**: ${decade.summary} Key pieces: ${decade.keyPieces.join(", ")}. Designers: ${decade.designers.join(", ")}.`;
  }).join("\n");
}

function buildDesignerReference(): string {
  return Object.entries(FASHION_KNOWLEDGE.designerAssociations).map(([designer, vibes]) => {
    return `**${designer}**: ${vibes.join(", ")}`;
  }).join("\n");
}

async function generateDescription(
  product: any,
  imageUrls: string[]
): Promise<string | null> {
  const imageContent = imageUrls.slice(0, 4).map((url: string) => ({
    type: "image_url" as const,
    image_url: { url, detail: "high" as const }
  }));

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

IMPORTANT: This is for AI MATCHING, not customer display. Be technical and thorough with classification.`;

  const parts = [];
  if (product.era) parts.push(`Era: ${product.era}`);
  if (product.designer?.name) parts.push(`Designer: ${product.designer.name}`);
  if (product.category) parts.push(`Category: ${product.category}`);
  if (product.color) parts.push(`Color: ${product.color}`);
  if (product.material) parts.push(`Material: ${product.material}`);
  const metadataContext = parts.length > 0 ? `Product metadata: ${parts.join(", ")}` : "";

  const userPrompt = product.description
    ? `Curator notes: "${product.description}"\n${metadataContext}\n\nAnalyze the images and create a CLASSIFICATION DESCRIPTION for our AI stylist.`
    : `${metadataContext}\n\nAnalyze these vintage fashion images and create a CLASSIFICATION DESCRIPTION for our AI stylist.`;

  const response = await openai.chat.completions.create({
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
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content || null;
}

async function main() {
  console.log("🔄 Starting batch AI description regeneration...\n");

  // Fetch all non-archived products
  const { data: products, error } = await supabase
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

  if (error) {
    console.error("Failed to fetch products:", error);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log("No products found.");
    process.exit(0);
  }

  console.log(`Found ${products.length} products to process.\n`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const product of products) {
    const media = product.media as { url: string; sort_order: number }[] || [];
    const mediaUrls = media.sort((a, b) => a.sort_order - b.sort_order).map(m => m.url);

    if (mediaUrls.length === 0) {
      console.log(`⏭️  Skipping "${product.name}" - no images`);
      skipped++;
      continue;
    }

    try {
      console.log(`🔄 Processing: ${product.name}...`);

      const aiDescription = await generateDescription(product, mediaUrls);

      if (!aiDescription) {
        throw new Error("No description generated");
      }

      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: aiDescription,
      });
      const embedding = embeddingResponse.data[0].embedding;

      // Update database
      const { error: updateError } = await supabase
        .from("products")
        .update({
          ai_description: aiDescription,
          ai_description_generated_at: new Date().toISOString(),
          description_embedding: embedding,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) {
        throw updateError;
      }

      processed++;
      console.log(`✅ ${product.name} (${processed}/${products.length - skipped})`);

      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`❌ ${product.name}: ${msg}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
