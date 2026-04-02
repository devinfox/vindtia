import { createClient } from "@/lib/supabase/server";
import RentalStatusManager from "@/components/admin/RentalStatusManager";

type Rental = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  tracking_number: string | null;
  return_tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  user?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  product?: {
    id: string;
    name: string;
    designer?: { name: string } | null;
  } | null;
};

export default async function AdminRentalsPage() {
  const supabase = await createClient();

  const { data: rentalsData } = await supabase
    .from("rentals")
    .select(
      `
      *,
      user:profiles(id, email, name),
      product:products(id, name, designer:designers(name))
    `
    )
    .order("created_at", { ascending: false });

  const rentals = rentalsData as Rental[] | null;

  const statusStyles: Record<string, string> = {
    pending:
      "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20",
    confirmed:
      "bg-blue-500/10 text-blue-400 border border-blue-400/20",
    shipped:
      "bg-indigo-500/10 text-indigo-400 border border-indigo-400/20",
    delivered:
      "bg-purple-500/10 text-purple-400 border border-purple-400/20",
    active:
      "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20",
    return_initiated:
      "bg-orange-500/10 text-orange-400 border border-orange-400/20",
    return_shipped:
      "bg-pink-500/10 text-pink-400 border border-pink-400/20",
    returned:
      "bg-teal-500/10 text-teal-400 border border-teal-400/20",
    completed:
      "bg-[var(--foreground)]/5 text-[var(--foreground)]/60 border border-[var(--foreground)]/10",
    cancelled:
      "bg-[#62130e]/10 text-[#62130e] border border-[#62130e]/20",
  };

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
          <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
            Operations
          </p>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
          Rentals & Returns
        </h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: "Pending", status: "pending" },
          { label: "Shipped", status: "shipped" },
          { label: "Active", status: "active" },
          { label: "Return Initiated", status: "return_initiated" },
          { label: "Return Shipped", status: "return_shipped" },
          { label: "Completed", status: "completed" },
        ].map(({ label, status }) => (
          <div
            key={status}
            className="bg-[var(--background)] border border-[var(--gold)]/10 p-5 hover:border-[var(--gold)]/30 transition-all duration-500"
          >
            <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
              {label}
            </p>
            <p className="font-display text-3xl text-[var(--foreground)]">
              {rentals?.filter((r) => r.status === status).length || 0}
            </p>
          </div>
        ))}
      </div>

      {rentals && rentals.length > 0 ? (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--background-warm)] border-b border-[var(--gold)]/10">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    ID
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Dates
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Tracking
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gold)]/10">
                {rentals.map((rental: any) => (
                  <tr
                    key={rental.id}
                    className="hover:bg-[var(--gold)]/5 transition-colors duration-300"
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-[var(--foreground)]/50">
                        {rental.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-editorial text-[var(--foreground)] text-sm">
                          {rental.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-[var(--foreground)]/50 italic">
                          {rental.user?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-editorial text-[var(--foreground)] text-sm">
                          {rental.product?.name || "N/A"}
                        </p>
                        <p className="text-xs text-[var(--foreground)]/50 italic">
                          {rental.product?.designer?.name || "No designer"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-editorial text-[var(--foreground)] text-sm">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[var(--foreground)]/50">
                        to {new Date(rental.end_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-button text-[9px] tracking-[0.1em] uppercase px-2 py-1 ${
                          statusStyles[rental.status] || statusStyles.pending
                        }`}
                      >
                        {rental.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {rental.tracking_number && (
                        <p className="text-xs text-[var(--foreground)]/50 font-mono">
                          Out: {rental.tracking_number}
                        </p>
                      )}
                      {rental.return_tracking_number && (
                        <p className="text-xs text-[var(--foreground)]/50 font-mono">
                          Ret: {rental.return_tracking_number}
                        </p>
                      )}
                      {!rental.tracking_number &&
                        !rental.return_tracking_number && (
                          <span className="text-[var(--foreground)]/30 text-xs">
                            —
                          </span>
                        )}
                    </td>
                    <td className="px-4 py-4">
                      <RentalStatusManager rental={rental} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-12 text-center">
          <p className="font-editorial text-[var(--foreground)]/60 italic">
            No rentals yet.
          </p>
        </div>
      )}
    </div>
  );
}
