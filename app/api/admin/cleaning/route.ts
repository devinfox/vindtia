import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { product_id, scheduled_date, cleaning_type, notes } = await req.json();

    if (!product_id || !scheduled_date) {
      return NextResponse.json(
        { error: "Product ID and scheduled date are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: schedule, error } = await supabase
      .from("cleaning_schedules")
      .insert([
        {
          product_id,
          scheduled_date,
          cleaning_type: cleaning_type || "standard",
          notes,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    console.error("Cleaning schedule creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create schedule" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data: schedules, error } = await supabase
      .from("cleaning_schedules")
      .select(
        `
        *,
        product:products(id, name, designer:designers(name)),
        rental:rentals(id, user:profiles(name, email))
      `
      )
      .order("scheduled_date", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error("Cleaning schedules fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
