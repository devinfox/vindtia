import { createClient } from "@/lib/supabase/server";

// Check dev bypass at runtime (not module load time)
function checkDevBypass(): boolean {
  return process.env.NODE_ENV === "development" && process.env.DEV_ADMIN_BYPASS === "true";
}

export async function isAdmin(): Promise<boolean> {
  // Dev bypass - skip all checks in development when enabled
  if (checkDevBypass()) {
    console.log("[DEV] Admin bypass enabled");
    return true;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return !!adminRole;
}

export async function requireAdmin() {
  // Dev bypass
  if (checkDevBypass()) {
    return true;
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return true;
}

// Export for use in layouts
export function isDevBypassEnabled(): boolean {
  return checkDevBypass();
}
