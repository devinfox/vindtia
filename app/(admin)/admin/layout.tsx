import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminRole) {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "◈" },
    { href: "/admin/products", label: "Products", icon: "◇" },
    { href: "/admin/designers", label: "Designers", icon: "◆" },
    { href: "/admin/rentals", label: "Rentals", icon: "◊" },
    { href: "/admin/orders", label: "Orders", icon: "□" },
    { href: "/admin/cleaning", label: "Cleaning", icon: "○" },
    { href: "/admin/analytics", label: "Analytics", icon: "◎" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] border-b border-[#C4B99A]/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="font-display text-xl tracking-[0.2em] text-[#F5F0E8]">
                VINDTIA
              </span>
              <span className="text-[#C4B99A]/50 text-xs tracking-[0.2em] uppercase border-l border-[#C4B99A]/30 pl-3">
                Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-button text-[10px] tracking-[0.15em] uppercase text-[#C4B99A]/60 hover:text-[#C4B99A] transition-colors"
            >
              View Site
            </Link>
            <Link
              href="/api/auth/logout"
              className="font-button text-[10px] tracking-[0.15em] uppercase text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-[65px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[65px] bottom-0 w-64 bg-[#1a1a1a] border-r border-[#C4B99A]/10 overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-[#F5F0E8]/70 hover:text-[#F5F0E8] hover:bg-[#C4B99A]/5 transition-all duration-300 group"
                  >
                    <span className="text-[#C4B99A]/50 group-hover:text-[#C4B99A] transition-colors">
                      {item.icon}
                    </span>
                    <span className="font-button text-xs tracking-[0.1em] uppercase">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#C4B99A]/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#62130e] flex items-center justify-center">
                <span className="text-[#F5F0E8] text-xs font-button">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F0E8] text-xs truncate">
                  {user.email}
                </p>
                <p className="text-[#C4B99A]/50 text-[10px] uppercase tracking-wider">
                  {adminRole.role}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-[calc(100vh-65px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
