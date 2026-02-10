import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }

    // Fetch existing profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    // If profile doesn't exist, create it
    if (!profile) {
      console.log("Profile not found, creating one for user:", user.id);
      const { error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
        });

      if (createError) {
        console.error("Profile creation error:", createError);
        return new Response(
          JSON.stringify({ error: `Failed to create profile: ${createError.message}` }),
          { status: 500 }
        );
      }
    }

    // If customer already exists, return it
    if (profile?.stripe_customer_id) {
      return Response.json({
        message: "Stripe customer already exists",
        stripe_customer_id: profile.stripe_customer_id,
      });
    }

    // Create a new customer in Stripe
    const stripeCustomer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: {
        supabase_uid: user.id,
      },
    });

    console.log("Stripe customer created:", stripeCustomer.id);

    // Store it in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_customer_id: stripeCustomer.id,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return new Response(
        JSON.stringify({
          error: `Failed to update profile: ${updateError.message}`,
        }),
        { status: 500 }
      );
    }

    return Response.json({
      message: "Stripe customer created",
      stripe_customer_id: stripeCustomer.id,
    });
  } catch (error: any) {
    console.error("Stripe customer creation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create Stripe customer",
      }),
      { status: 500 }
    );
  }
}
