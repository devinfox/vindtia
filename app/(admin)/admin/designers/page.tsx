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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Designers
        </h1>
        <Link
          href="/admin/designers/new"
          className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          + Add Designer
        </Link>
      </div>

      {designers && designers.length > 0 ? (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {designers.map((designer: any) => (
                <tr key={designer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {designer.image_url && (
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={designer.image_url}
                            alt={designer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">
                          {designer.name}
                        </p>
                        {designer.bio && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                            {designer.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {designer.products?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(designer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/designers/${designer.id}/edit`}
                      className="inline-block px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteDesignerButton
                      designerId={designer.id}
                      designerName={designer.name}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No designers yet. Add your first designer to get started.
          </p>
          <Link
            href="/admin/designers/new"
            className="inline-block px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            + Add Designer
          </Link>
        </div>
      )}
    </div>
  );
}
