import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { name, bio, image_url } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("designers")
      .insert([{ name, bio, image_url }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Designer creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create designer" },
      { status: 500 }
    );
  }
}
