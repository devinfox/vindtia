import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
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

    const { rental_id, amount } = await req.json();

    if (!rental_id || !amount) {
      return NextResponse.json(
        { error: "Rental ID and amount are required" },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer ID found" },
        { status: 400 }
      );
    }

    // Get rental details
    const { data: rental } = await supabase
      .from("rentals")
      .select("*, product:products(name)")
      .eq("id", rental_id)
      .eq("user_id", user.id)
      .single();

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    if (rental.status !== "pending") {
      return NextResponse.json(
        { error: "Rental is not in pending status" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Rental: ${rental.product?.name || "Product"}`,
              description: `Rental period: ${rental.start_date} to ${rental.end_date}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        rental_id,
        user_id: user.id,
      },
      success_url: `${siteUrl}/rental-success?rental_id=${rental_id}`,
      cancel_url: `${siteUrl}/checkout/${rental_id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
