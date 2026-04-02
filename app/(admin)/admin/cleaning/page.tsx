import { createClient } from "@/lib/supabase/server";
import CleaningScheduleManager from "@/components/admin/CleaningScheduleManager";

type Schedule = {
  id: string;
  product_id: string;
  scheduled_date: string;
  status: string;
  cleaning_type: string;
  notes: string | null;
  product?: {
    id: string;
    name: string;
    designer?: { name: string } | null;
  } | null;
  rental?: {
    id: string;
    user?: { name: string; email: string } | null;
  } | null;
};

type Product = {
  id: string;
  name: string;
};

export default async function CleaningSchedulesPage() {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("cleaning_schedules")
    .select(
      `
      *,
      product:products(id, name, designer:designers(name)),
      rental:rentals(id, user:profiles(name, email))
    `
    )
    .order("scheduled_date", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .order("name");

  const statusStyles: Record<string, string> = {
    pending:
      "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20",
    in_progress:
      "bg-blue-500/10 text-blue-400 border border-blue-400/20",
    completed:
      "bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20",
    skipped:
      "bg-[var(--foreground)]/5 text-[var(--foreground)]/50 border border-[var(--foreground)]/10",
  };

  const cleaningTypeLabels: Record<string, string> = {
    standard: "Standard Clean",
    deep: "Deep Clean",
    spot: "Spot Clean",
    preservation: "Preservation",
  };

  const typedSchedules = schedules as Schedule[] | null;
  const pendingCount =
    typedSchedules?.filter((s) => s.status === "pending").length || 0;
  const inProgressCount =
    typedSchedules?.filter((s) => s.status === "in_progress").length || 0;
  const todaySchedules =
    typedSchedules?.filter(
      (s) =>
        s.status === "pending" &&
        new Date(s.scheduled_date).toDateString() === new Date().toDateString()
    ) || [];
  const overdueSchedules =
    typedSchedules?.filter(
      (s) =>
        s.status === "pending" &&
        new Date(s.scheduled_date) < new Date(new Date().toDateString())
    ) || [];

  return (
    <div className="p-8 lg:p-12 bg-[var(--background-warm)] min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] bg-[#C4B99A]/40" />
            <p className="text-[#C4B99A] text-[10px] tracking-[0.3em] uppercase">
              Preservation
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-[var(--foreground)] tracking-wide">
            Cleaning Schedules
          </h1>
        </div>
        <CleaningScheduleManager
          products={(products as Product[] | null) || []}
          mode="create"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-5 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            Pending
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            {pendingCount}
          </p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-5 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            In Progress
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            {inProgressCount}
          </p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-5 hover:border-[var(--gold)]/30 transition-all duration-500">
          <p className="text-[var(--gold)] text-[10px] tracking-[0.2em] uppercase mb-2">
            Today
          </p>
          <p className="font-display text-3xl text-[var(--foreground)]">
            {todaySchedules.length}
          </p>
        </div>
        <div className="bg-[var(--background)] border border-[#62130e]/20 p-5 hover:border-[#62130e]/40 transition-all duration-500">
          <p className="text-[#62130e] text-[10px] tracking-[0.2em] uppercase mb-2">
            Overdue
          </p>
          <p className="font-display text-3xl text-[#62130e]">
            {overdueSchedules.length}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueSchedules.length > 0 && (
        <div className="mb-8 p-5 bg-[#62130e]/5 border border-[#62130e]/20">
          <p className="font-editorial text-[#62130e]">
            {overdueSchedules.length} overdue cleaning
            {overdueSchedules.length !== 1 ? "s" : ""} require attention
          </p>
        </div>
      )}

      {/* Schedules Table */}
      {typedSchedules && typedSchedules.length > 0 ? (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--background-warm)] border-b border-[var(--gold)]/10">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Type
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    From
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Notes
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-button text-[var(--gold)] tracking-[0.2em] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gold)]/10">
                {typedSchedules.map((schedule) => {
                  const isOverdue =
                    schedule.status === "pending" &&
                    new Date(schedule.scheduled_date) <
                      new Date(new Date().toDateString());

                  return (
                    <tr
                      key={schedule.id}
                      className={`hover:bg-[var(--gold)]/5 transition-colors duration-300 ${
                        isOverdue ? "bg-[#62130e]/5" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-editorial text-[var(--foreground)] text-sm">
                            {schedule.product?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-[var(--foreground)]/50 italic">
                            {schedule.product?.designer?.name || "No designer"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p
                            className={`font-editorial text-sm ${
                              isOverdue
                                ? "text-[#62130e]"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            {new Date(
                              schedule.scheduled_date
                            ).toLocaleDateString()}
                          </p>
                          {isOverdue && (
                            <p className="text-[9px] text-[#62130e] font-button tracking-[0.1em] uppercase">
                              Overdue
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-editorial text-[var(--foreground)] text-sm">
                          {cleaningTypeLabels[schedule.cleaning_type] ||
                            schedule.cleaning_type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-button text-[9px] tracking-[0.1em] uppercase px-2 py-1 ${
                            statusStyles[schedule.status] || statusStyles.pending
                          }`}
                        >
                          {schedule.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {schedule.rental ? (
                          <span className="text-xs text-[var(--foreground)]/60">
                            {schedule.rental.user?.name ||
                              schedule.rental.user?.email ||
                              "Unknown"}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--foreground)]/30 italic">
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-[var(--foreground)]/50 max-w-xs truncate block">
                          {schedule.notes || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <CleaningScheduleManager
                          schedule={schedule}
                          products={(products as Product[] | null) || []}
                          mode="update"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--background)] border border-[var(--gold)]/10 p-12 text-center">
          <p className="font-editorial text-[var(--foreground)]/60 italic mb-4">
            No cleaning schedules yet.
          </p>
          <p className="text-sm text-[var(--foreground)]/40">
            Cleaning schedules are automatically created when rentals are
            returned.
          </p>
        </div>
      )}
    </div>
  );
}
