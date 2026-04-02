import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

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
      .update({
        name,
        slug,
        bio,
        image_url,
        founded,
        origin,
        headquarters,
        signature,
        featured: featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Designer update error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update designer";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

    const supabase = await createClient();

    const { error } = await supabase
      .from("designers")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Designer deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete designer" },
      { status: 500 }
    );
  }
}
