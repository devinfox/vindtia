import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { product_id, start_date, end_date } = await req.json();

    if (!product_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Product ID, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Get user profile and membership tier info
    const { data: profile } = await supabase
      .from("profiles")
      .select("membership_tier")
      .eq("id", user.id)
      .single();

    if (!profile || profile.membership_tier === 0) {
      return NextResponse.json(
        { error: "Membership required to rent" },
        { status: 403 }
      );
    }

    // Get tier limits
    const { data: tierInfo } = await supabase
      .from("membership_tiers")
      .select("monthly_rental_limit, rental_duration_days, rental_window_days")
      .eq("id", profile.membership_tier)
      .single();

    // Check rental duration
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const duration = Math.ceil(
      (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (tierInfo && duration > tierInfo.rental_duration_days) {
      return NextResponse.json(
        { error: `Maximum rental duration is ${tierInfo.rental_duration_days} days for your tier` },
        { status: 400 }
      );
    }

    // Check rental limit (rolling 2-week window)
    if (tierInfo?.monthly_rental_limit && tierInfo.monthly_rental_limit > 0) {
      const windowDays = tierInfo.rental_window_days || 14;
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - windowDays);
      windowStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("rentals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("status", "in", '("cancelled","returned","completed")')
        .gte("created_at", windowStart.toISOString());

      if (count !== null && count >= tierInfo.monthly_rental_limit) {
        return NextResponse.json(
          { error: `Rental limit reached. You can rent ${tierInfo.monthly_rental_limit} item${tierInfo.monthly_rental_limit > 1 ? 's' : ''} per ${windowDays} days.` },
          { status: 400 }
        );
      }
    }

    // Check if product exists and is available
    const { data: product } = await supabase
      .from("products")
      .select("*, inventory:inventory(quantity)")
      .eq("id", product_id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check tier requirement
    if (product.tier_required > profile.membership_tier) {
      return NextResponse.json(
        { error: "Your membership tier does not have access to this product" },
        { status: 403 }
      );
    }

    // Check inventory
    if (!product.inventory?.[0]?.quantity || product.inventory[0].quantity <= 0) {
      return NextResponse.json(
        { error: "Product is out of stock" },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const { data: conflictingRentals } = await supabase
      .from("rentals")
      .select("id")
      .eq("product_id", product_id)
      .not("status", "in", '("cancelled","returned","completed")')
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (conflictingRentals && conflictingRentals.length > 0) {
      return NextResponse.json(
        { error: "Selected dates are not available" },
        { status: 400 }
      );
    }

    // Create rental
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .insert([
        {
          user_id: user.id,
          product_id,
          start_date,
          end_date,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (rentalError) throw rentalError;

    return NextResponse.json({ rental }, { status: 201 });
  } catch (error: any) {
    console.error("Rental creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create rental" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");

    if (productId) {
      // Get booked dates for a product
      const { data: rentals } = await supabase
        .from("rentals")
        .select("start_date, end_date")
        .eq("product_id", productId)
        .not("status", "in", '("cancelled","returned","completed")');

      return NextResponse.json({ bookedDates: rentals || [] });
    }

    // Get user's rentals
    const { data: rentals } = await supabase
      .from("rentals")
      .select(
        `
        *,
        product:products(id, name, price_per_rental, designer:designers(name))
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ rentals: rentals || [] });
  } catch (error: any) {
    console.error("Rental fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}
