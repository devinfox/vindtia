import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define what tier each route requires
const PROTECTED_ROUTES: Record<string, number> = {
  "/dashboard": 1,
  "/library": 1,
  "/premium": 2,
  "/ultimate": 3,
};

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(
              cookiesToSet: { name: string; value: string; options?: Record<string, any> }[]
            ) {
              cookiesToSet.forEach(({ name, value }) =>
                req.cookies.set(name, value)
              );

              supabaseResponse = NextResponse.next({ request: req });

              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },

        },
      }
    );

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const urlPath = req.nextUrl.pathname;

    // Check if the route is protected
    const requiredTier = PROTECTED_ROUTES[urlPath];

    // If route is not protected, allow access
    if (!requiredTier) return supabaseResponse;

    // If user not logged in → redirect to login
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", urlPath);
      return NextResponse.redirect(redirectUrl);
    }

    // Fetch membership tier from Supabase
    const { data: profile } = await supabase
      .from("profiles")
      .select("membership_tier")
      .eq("id", session.user.id)
      .single();

    const userTier = profile?.membership_tier ?? 0;

    // If user tier is lower than required → redirect to upgrade page
    if (userTier < requiredTier) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/upgrade";
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  } catch (error) {
    // If Supabase connection fails, allow the request through
    console.error("Middleware Supabase error:", error);
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/library/:path*",
    "/premium/:path*",
    "/ultimate/:path*",
  ],
};
