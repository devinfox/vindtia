"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserMenuProps = {
  email?: string;
  name?: string;
};

export default function UserMenu({ email, name }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        {name && (
          <p className="text-sm font-medium text-black dark:text-white">
            {name}
          </p>
        )}
        {email && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{email}</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
