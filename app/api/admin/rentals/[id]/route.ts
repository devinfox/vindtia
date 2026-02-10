import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

    const updates = await req.json();
    const supabase = await createClient();

    // Update rental
    const { data: rental, error } = await supabase
      .from("rentals")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ rental });
  } catch (error: any) {
    console.error("Rental update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update rental" },
      { status: 500 }
    );
  }
}

export async function GET(_req: Request, props: { params: Params }) {
  try {
    await requireAdmin();
    const params = await props.params;

    const supabase = await createClient();

    const { data: rental, error } = await supabase
      .from("rentals")
      .select(
        `
        *,
        user:profiles(id, email, name),
        product:products(id, name, designer:designers(name))
      `
      )
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ rental });
  } catch (error: any) {
    console.error("Rental fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch rental" },
      { status: 500 }
    );
  }
}
