import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function DELETE(_req: Request, props: { params: Params }) {
  try {
    const params = await props.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get rental to check ownership and status
    const { data: rental } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    // Only allow cancellation of pending rentals
    if (rental.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cancel pending rentals" },
        { status: 400 }
      );
    }

    // Delete the rental
    const { error } = await supabase
      .from("rentals")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Rental cancellation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel rental" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, props: { params: Params }) {
  try {
    const params = await props.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    // Get rental to check ownership
    const { data: rental } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    // Update the rental
    const { data: updatedRental, error } = await supabase
      .from("rentals")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ rental: updatedRental });
  } catch (error: any) {
    console.error("Rental update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update rental" },
      { status: 500 }
    );
  }
}
