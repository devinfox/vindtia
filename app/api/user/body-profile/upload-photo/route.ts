import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const photoType = formData.get("type") as string | null; // 'front' or 'side'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!photoType || !['front', 'side'].includes(photoType)) {
      return NextResponse.json({ error: "Invalid photo type. Must be 'front' or 'side'" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${photoType}-${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      // If bucket doesn't exist, provide helpful error
      if (uploadError.message?.includes("Bucket not found")) {
        return NextResponse.json({
          error: "Photo storage not configured. Please contact support.",
          details: "The user-photos storage bucket needs to be created in Supabase."
        }, { status: 500 });
      }

      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("user-photos")
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Update profile with new photo URL
    const updateField = photoType === 'front' ? 'front_photo_url' : 'side_photo_url';
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        [updateField]: photoUrl,
        body_profile_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to update profile with photo" }, { status: 500 });
    }

    // Delete old photo if exists (optional cleanup)
    // We could track and delete old photos here to save storage space

    return NextResponse.json({
      success: true,
      url: photoUrl,
      type: photoType,
    });
  } catch (error) {
    console.error("Error in POST /api/user/body-profile/upload-photo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a photo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoType = searchParams.get("type");

    if (!photoType || !['front', 'side'].includes(photoType)) {
      return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
    }

    // Get current photo URL to delete from storage
    const { data: profile } = await supabase
      .from("profiles")
      .select(photoType === 'front' ? 'front_photo_url' : 'side_photo_url')
      .eq("id", user.id)
      .single();

    const currentUrl = photoType === 'front' ? profile?.front_photo_url : profile?.side_photo_url;

    // Delete from storage if URL exists
    if (currentUrl) {
      // Extract path from URL
      const urlParts = currentUrl.split('/user-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("user-photos").remove([filePath]);
      }
    }

    // Clear URL in profile
    const updateField = photoType === 'front' ? 'front_photo_url' : 'side_photo_url';
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        [updateField]: null,
        body_profile_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to remove photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/user/body-profile/upload-photo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
