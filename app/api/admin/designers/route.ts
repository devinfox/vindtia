import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("designers")
      .select("id, name")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Designer fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch designers";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const {
      name,
      slug,
      bio,
      image_url,
      founded,
      origin,
      headquarters,
      signature,
      featured,
    } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("designers")
      .insert([{
        name,
        slug,
        bio,
        image_url,
        founded,
        origin,
        headquarters,
        signature,
        featured: featured || false,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error("Designer creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create designer";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
