import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

export const runtime = "nodejs"; // ensures raw body support

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables not configured");
  }

  return createClient(url, key);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Handle membership tier updates
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const tier =
        subscription.items.data[0].price.metadata.tier_number
          ? Number(subscription.items.data[0].price.metadata.tier_number)
          : 0;

      // Find the Supabase user linked to this Stripe customer
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile?.id) {
        await supabaseAdmin
          .from("profiles")
          .update({ membership_tier: tier })
          .eq("id", profile.id);
      }

      console.log(
        `Updated membership tier to ${tier} for customer ${customerId}`
      );
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile?.id) {
        await supabaseAdmin
          .from("profiles")
          .update({ membership_tier: 0 })
          .eq("id", profile.id);
      }

      console.log(`Removed membership for customer ${customerId}`);
    }
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    // Return 200 to acknowledge receipt even if processing fails
    // Stripe will retry if we return an error
  }

  return new Response("OK", { status: 200 });
}
