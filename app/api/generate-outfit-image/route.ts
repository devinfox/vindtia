import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type GenderIdentity = 'male' | 'female' | 'nonbinary' | null;
type PresentationStyle = 'masculine' | 'feminine';

type UserBodyProfile = {
  front_photo_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  body_type: string | null;
  skin_tone: string | null;
  ethnicity: string | null;
  hair_color: string | null;
  hair_length: string | null;
  gender_identity: GenderIdentity;
  presentation_style_preference: PresentationStyle[] | null;
};

// Simple: if user's profile is set to masculine, use "man", otherwise "woman"
function determineModelPresentation(
  userStylePreference: PresentationStyle[] | null
): 'masculine' | 'feminine' {
  // If user has masculine in their style preference, use masculine
  if (userStylePreference && userStylePreference.includes('masculine')) {
    return 'masculine';
  }
  // Default to feminine
  return 'feminine';
}

// Helper to fetch image and convert to base64
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    if (url.startsWith('data:')) {
      const base64Match = url.match(/base64,(.+)/);
      return base64Match ? base64Match[1] : null;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.error("Error fetching image for base64:", error);
    return null;
  }
}

// Generate outfit image using Gemini - understands multiple input images
async function generateWithGemini(
  prompt: string,
  clothingImages: { base64: string; mimeType: string; description: string; color?: string; material?: string; category?: string }[],
  userPhoto: { base64: string; mimeType: string } | null,
  userProfile: UserBodyProfile | null,
  modelPresentation: 'masculine' | 'feminine' = 'feminine'
): Promise<{ imageUrl: string }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  console.log(`Generating with Gemini, ${clothingImages.length} clothing images, user photo: ${userPhoto ? 'yes' : 'no'}, presentation: ${modelPresentation}`);

  // Build physical characteristics description from profile
  let physicalDescription = "";
  let hairDescription = "";
  let appearanceSummary = "";

  if (userProfile) {
    const traits: string[] = [];

    if (userProfile.body_type) {
      traits.push(`${userProfile.body_type} body type`);
    }
    if (userProfile.height_cm) {
      const feet = Math.floor(userProfile.height_cm / 30.48);
      const inches = Math.round((userProfile.height_cm / 2.54) % 12);
      traits.push(`${feet}'${inches}" tall`);
    }
    if (userProfile.bust_cm && userProfile.waist_cm && userProfile.hips_cm) {
      const bust = Math.round(userProfile.bust_cm / 2.54);
      const waist = Math.round(userProfile.waist_cm / 2.54);
      const hips = Math.round(userProfile.hips_cm / 2.54);
      traits.push(`measurements ${bust}-${waist}-${hips}`);
    }
    if (userProfile.ethnicity && userProfile.ethnicity !== "Prefer not to say") {
      traits.push(`${userProfile.ethnicity} ethnicity`);
      appearanceSummary += `${userProfile.ethnicity}, `;
    }
    if (userProfile.skin_tone) {
      traits.push(`${userProfile.skin_tone} skin tone`);
      appearanceSummary += `${userProfile.skin_tone} skin, `;
    }

    // Build explicit hair description
    if (userProfile.hair_color && userProfile.hair_length) {
      hairDescription = `${userProfile.hair_color.toUpperCase()} hair in a ${userProfile.hair_length.toUpperCase()} style`;
      traits.push(hairDescription);
      appearanceSummary += `${userProfile.hair_color} ${userProfile.hair_length} hair`;
    } else if (userProfile.hair_color) {
      hairDescription = `${userProfile.hair_color.toUpperCase()} hair color`;
      traits.push(hairDescription);
      appearanceSummary += `${userProfile.hair_color} hair`;
    } else if (userProfile.hair_length) {
      hairDescription = `${userProfile.hair_length.toUpperCase()} hair length`;
      traits.push(hairDescription);
    }

    if (traits.length > 0) {
      physicalDescription = `\n\n⚠️ MANDATORY PHYSICAL CHARACTERISTICS - DO NOT IGNORE:\n- ${traits.join('\n- ')}`;
    }
  }

  console.log("Physical description being sent:", physicalDescription);
  console.log("Hair description:", hairDescription);
  console.log("Appearance summary:", appearanceSummary);

  // Build the parts array with text prompt and all images
  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

  // CRITICAL: Start with clear instruction that this is a FASHION PHOTO, not a portrait
  // Keep it simple for Gemini - just "man" or "woman"
  const modelDesc = modelPresentation === 'masculine' ? 'man' : 'woman';

  // Simple, clean prompt - less is more
  parts.push({
    text: `Generate a full-body fashion photo of a ${modelDesc} wearing these exact clothing items:`
  });

  // Add each clothing image with minimal text
  for (const img of clothingImages) {
    parts.push({
      text: `\n${img.category || 'Item'}:`
    });
    parts.push({
      inline_data: {
        mime_type: img.mimeType,
        data: img.base64
      }
    });
  }

  // If we have a user photo, add it with simple instruction
  if (userPhoto) {
    parts.push({
      text: `\nUse this person's face (ignore their clothing):`
    });
    parts.push({
      inline_data: {
        mime_type: userPhoto.mimeType,
        data: userPhoto.base64
      }
    });
  }

  // Simple final instruction
  const physicalTraits: string[] = [];
  if (userProfile?.skin_tone) physicalTraits.push(userProfile.skin_tone + ' skin');
  if (userProfile?.hair_color) physicalTraits.push(userProfile.hair_color + ' hair');

  parts.push({
    text: `
Requirements:
- Full body shot (head to toe visible)
- The ${modelDesc} wears the exact clothing items shown above
- Clean studio background
- Fashion editorial style
${physicalTraits.length > 0 ? `- Model has ${physicalTraits.join(', ')}` : ''}
${userPhoto ? '- Face matches the reference photo, but clothing comes ONLY from the clothing items above' : ''}`
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Gemini full response:", JSON.stringify(data, null, 2).substring(0, 1500));

  // Check for blocked content or errors
  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
  }

  if (!data.candidates || data.candidates.length === 0) {
    console.error("No candidates in response:", JSON.stringify(data));
    throw new Error("Gemini returned no candidates - content may have been filtered");
  }

  // Check finish reason
  const finishReason = data.candidates[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    console.error("Unexpected finish reason:", finishReason);
  }

  // Extract the generated image from the response
  if (data.candidates[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      // Check for inlineData (image)
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        console.log("Found image in response, mimeType:", mimeType);
        return {
          imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
        };
      }
      // Log any text parts
      if (part.text) {
        console.log("Gemini text response:", part.text.substring(0, 500));
      }
    }
  }

  throw new Error("No image generated by Gemini - response contained only text");
}

export async function POST(req: Request) {
  try {
    const { prompt, productImages, styleVibe, usePersonalizedModel, userGenderIdentity, userStylePreference } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Fetch user's body profile if personalized model is requested
    let userProfile: UserBodyProfile | null = null;

    if (usePersonalizedModel) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select(`
              front_photo_url,
              height_cm,
              weight_kg,
              bust_cm,
              waist_cm,
              hips_cm,
              body_type,
              skin_tone,
              ethnicity,
              hair_color,
              hair_length,
              gender_identity,
              presentation_style_preference
            `)
            .eq("id", user.id)
            .single();

          if (profile) {
            userProfile = profile;
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    // Fetch all clothing images as base64
    const clothingImages: { base64: string; mimeType: string; description: string; color?: string; material?: string; category?: string }[] = [];

    if (productImages && Array.isArray(productImages)) {
      for (const product of productImages) {
        if (product.imageUrl) {
          const base64 = await imageUrlToBase64(product.imageUrl);
          if (base64) {
            const mimeType = product.imageUrl.includes('.png') ? 'image/png' : 'image/jpeg';

            // Keep description simple - just name and key details
            const descParts: string[] = [product.name];
            if (product.color) descParts.push(`(${product.color})`);

            clothingImages.push({
              base64,
              mimeType,
              description: descParts.join(' '),
              color: product.color,
              material: product.material,
              category: product.category,
            });
          }
        }
      }
    }

    if (clothingImages.length === 0) {
      return NextResponse.json(
        { error: "No valid clothing images provided" },
        { status: 400 }
      );
    }

    console.log(`Generating outfit with ${clothingImages.length} items: ${clothingImages.map(c => c.description).join(', ')}`);

    // Fetch user's profile photo if available
    let userPhoto: { base64: string; mimeType: string } | null = null;
    if (userProfile?.front_photo_url) {
      console.log("Fetching user profile photo for reference...");
      const photoBase64 = await imageUrlToBase64(userProfile.front_photo_url);
      if (photoBase64) {
        const mimeType = userProfile.front_photo_url.includes('.png') ? 'image/png' : 'image/jpeg';
        userPhoto = { base64: photoBase64, mimeType };
        console.log("User photo loaded successfully");
      }
    }

    // Determine model: if user's profile is masculine, use "man", otherwise "woman"
    const modelPresentation = determineModelPresentation(
      userProfile?.presentation_style_preference || userStylePreference || null
    );

    const fullPrompt = styleVibe || prompt;
    const response = await generateWithGemini(fullPrompt, clothingImages, userPhoto, userProfile, modelPresentation);

    return NextResponse.json({
      success: true,
      imageUrl: response.imageUrl,
      prompt: fullPrompt,
      personalized: !!userPhoto,
      method: "gemini",
      itemsIncluded: clothingImages.map(c => c.description),
    });

  } catch (error: unknown) {
    console.error("Outfit image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
