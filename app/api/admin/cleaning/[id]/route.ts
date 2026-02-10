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

    const { data: schedule, error } = await supabase
      .from("cleaning_schedules")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error("Cleaning schedule update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update schedule" },
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
      .from("cleaning_schedules")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cleaning schedule deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
