// Run with: node scripts/setup-admin.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupAdmin() {
  const email = "devin@devinfoxmusic.com";
  const password = "test1234";

  console.log(`Setting up admin user: ${email}`);

  // Try to create the user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId;

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("User already exists, fetching user...");
      // Get existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find((u) => u.email === email);
      if (!existingUser) {
        console.error("Could not find existing user");
        process.exit(1);
      }
      userId = existingUser.id;

      // Update password
      await supabase.auth.admin.updateUserById(userId, { password });
      console.log("Password updated");
    } else {
      console.error("Error creating user:", authError);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log("User created:", userId);
  }

  // Ensure profile exists FIRST (admin_roles has FK to profiles)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      membership_tier: 3,
    });
    if (profileError) {
      console.error("Error creating profile:", profileError);
      process.exit(1);
    }
    console.log("Profile created with tier 3");
  } else {
    console.log("Profile already exists");
  }

  // Check if already admin
  const { data: existingRole } = await supabase
    .from("admin_roles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existingRole) {
    console.log("User is already an admin");
  } else {
    // Add to admin_roles
    const { error: roleError } = await supabase.from("admin_roles").insert({
      user_id: userId,
      role: "super_admin",
    });

    if (roleError) {
      console.error("Error adding admin role:", roleError);
      process.exit(1);
    }
    console.log("Admin role added");
  }

  console.log("\n✅ Admin setup complete!");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Login at: /login`);
}

setupAdmin();
