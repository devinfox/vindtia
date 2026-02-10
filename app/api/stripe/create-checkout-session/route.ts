import { stripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { tier } = await req.json();

    const priceIdMap: Record<number, string> = {
      1: process.env.STRIPE_TIER1_PRICE_ID!,
      2: process.env.STRIPE_TIER2_PRICE_ID!,
      3: process.env.STRIPE_TIER3_PRICE_ID!,
    };

    const priceId = priceIdMap[tier];
    if (!priceId) {
      return Response.json({ error: "Invalid tier" }, { status: 400 });
    }

    // ⭐ Next.js 15: cookies() is ASYNC
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return Response.json(
        { error: "No Stripe customer found." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: profile.stripe_customer_id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    return Response.json(
      { error: error.message ?? "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
