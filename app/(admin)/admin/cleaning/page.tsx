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

  // Fetch cleaning schedules with product info
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

  // Get all products for creating new schedules
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .order("name");

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
    in_progress: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
    completed: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
    skipped: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-400",
  };

  const cleaningTypeLabels: Record<string, string> = {
    standard: "Standard Clean",
    deep: "Deep Clean",
    spot: "Spot Clean",
    preservation: "Preservation",
  };

  // Group schedules by status for overview
  const typedSchedules = schedules as Schedule[] | null;
  const pendingCount = typedSchedules?.filter((s) => s.status === "pending").length || 0;
  const inProgressCount = typedSchedules?.filter((s) => s.status === "in_progress").length || 0;
  const todaySchedules = typedSchedules?.filter(
    (s) =>
      s.status === "pending" &&
      new Date(s.scheduled_date).toDateString() === new Date().toDateString()
  ) || [];
  const overdueSchedules = typedSchedules?.filter(
    (s) =>
      s.status === "pending" &&
      new Date(s.scheduled_date) < new Date(new Date().toDateString())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Cleaning Schedules
        </h1>
        <CleaningScheduleManager products={(products as Product[] | null) || []} mode="create" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {pendingCount}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            In Progress
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {inProgressCount}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            Today
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {todaySchedules.length}
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-red-600 dark:text-red-400 mb-1">
            Overdue
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueSchedules.length}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueSchedules.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-400">
            {overdueSchedules.length} overdue cleaning{overdueSchedules.length !== 1 ? "s" : ""} require attention
          </p>
        </div>
      )}

      {/* Schedules Table */}
      {typedSchedules && typedSchedules.length > 0 ? (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    From Rental
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {typedSchedules.map((schedule) => {
                  const isOverdue =
                    schedule.status === "pending" &&
                    new Date(schedule.scheduled_date) < new Date(new Date().toDateString());

                  return (
                    <tr
                      key={schedule.id}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                        isOverdue ? "bg-red-50/50 dark:bg-red-900/10" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-black dark:text-white">
                            {schedule.product?.name || "Unknown"}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                            {schedule.product?.designer?.name || "No designer"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p
                            className={`font-medium ${
                              isOverdue
                                ? "text-red-600 dark:text-red-400"
                                : "text-black dark:text-white"
                            }`}
                          >
                            {new Date(schedule.scheduled_date).toLocaleDateString()}
                          </p>
                          {isOverdue && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Overdue
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-black dark:text-white">
                        {cleaningTypeLabels[schedule.cleaning_type] || schedule.cleaning_type}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            statusColors[schedule.status] || statusColors.pending
                          }`}
                        >
                          {schedule.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-400">
                        {schedule.rental ? (
                          <span>
                            {schedule.rental.user?.name || schedule.rental.user?.email || "Unknown"}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">Manual</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {schedule.notes || "-"}
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
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No cleaning schedules yet.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Cleaning schedules are automatically created when rentals are returned.
          </p>
        </div>
      )}
    </div>
  );
}
