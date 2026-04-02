import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Retrieve user's body profile
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        front_photo_url,
        side_photo_url,
        height_cm,
        weight_kg,
        bust_cm,
        waist_cm,
        hips_cm,
        inseam_cm,
        shoulder_width_cm,
        clothing_size_top,
        clothing_size_bottom,
        shoe_size,
        skin_tone,
        ethnicity,
        hair_color,
        hair_length,
        body_type,
        style_preferences,
        body_profile_updated_at,
        gender_identity,
        presentation_style_preference
      `)
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching body profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error in GET /api/user/body-profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user's body profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate and sanitize input
    const allowedFields = [
      'front_photo_url',
      'side_photo_url',
      'height_cm',
      'weight_kg',
      'bust_cm',
      'waist_cm',
      'hips_cm',
      'inseam_cm',
      'shoulder_width_cm',
      'clothing_size_top',
      'clothing_size_bottom',
      'shoe_size',
      'skin_tone',
      'ethnicity',
      'hair_color',
      'hair_length',
      'body_type',
      'style_preferences',
      'gender_identity',
      'presentation_style_preference',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Add timestamp
    updateData.body_profile_updated_at = new Date().toISOString();

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating body profile:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Error in PUT /api/user/body-profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
