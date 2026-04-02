import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteDesignerButton from "@/components/admin/DeleteDesignerButton";

export default async function DesignersPage() {
  const supabase = await createClient();

  const { data: designers } = await supabase
    .from("designers")
    .select("*, products:products(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
            <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
              Collection
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
            Designers
          </h1>
        </div>
        <Link
          href="/admin/designers/new"
          className="font-button px-6 py-3 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-all duration-500"
        >
          + Add Designer
        </Link>
      </div>

      {designers && designers.length > 0 ? (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--background-warm)] border-b border-[var(--gold)]/10">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Designer
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gold)]/10">
              {designers.map((designer: any) => (
                <tr
                  key={designer.id}
                  className="hover:bg-[var(--gold)]/5 transition-colors duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {designer.image_url && (
                        <div className="w-12 h-12 bg-[var(--background-warm)] overflow-hidden flex-shrink-0 border border-[var(--gold)]/20">
                          <img
                            src={designer.image_url}
                            alt={designer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-editorial text-[var(--foreground)]">
                          {designer.name}
                        </p>
                        {designer.bio && (
                          <p className="text-xs text-[var(--foreground)]/50 italic line-clamp-1 max-w-xs">
                            {designer.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-[var(--foreground)]/60">
                      {designer.slug || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-editorial text-[var(--foreground)]">
                      {designer.products?.[0]?.count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {designer.featured ? (
                      <span className="font-button text-[9px] tracking-[0.1em] uppercase px-3 py-1 bg-[var(--gold)] text-[#1a1a1a]">
                        Featured
                      </span>
                    ) : (
                      <span className="text-[var(--foreground)]/30 text-sm">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/designers/${designer.id}/edit`}
                        className="font-button px-3 py-2 border border-[var(--gold)]/30 text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)] hover:bg-[var(--gold)]/5 hover:border-[var(--gold)] transition-all duration-300"
                      >
                        Edit
                      </Link>
                      <DeleteDesignerButton
                        designerId={designer.id}
                        designerName={designer.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-12 text-center">
          <p className="font-editorial text-[var(--foreground)]/60 italic mb-6">
            No designers yet. Add your first designer to get started.
          </p>
          <Link
            href="/admin/designers/new"
            className="font-button inline-block px-8 py-4 bg-[#62130e] text-[#F5F0E8] text-xs tracking-[0.2em] uppercase hover:bg-[#4a0f0b] transition-all duration-500"
          >
            + Add Designer
          </Link>
        </div>
      )}
    </div>
  );
}
