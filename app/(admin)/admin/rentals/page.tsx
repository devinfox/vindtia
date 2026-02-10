import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
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

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
    confirmed: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
    shipped: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400",
    delivered: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400",
    active: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
    return_initiated: "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400",
    return_shipped: "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400",
    returned: "bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400",
    completed: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400",
    cancelled: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Rentals & Returns
        </h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
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
            className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
          >
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-black dark:text-white">
              {rentals?.filter((r) => r.status === status).length || 0}
            </p>
          </div>
        ))}
      </div>

      {rentals && rentals.length > 0 ? (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Rental ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rentals.map((rental: any) => (
                  <tr
                    key={rental.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-4 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                      {rental.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-black dark:text-white">
                          {rental.user?.name || "Unknown"}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                          {rental.user?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-black dark:text-white">
                          {rental.product?.name || "N/A"}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                          {rental.product?.designer?.name || "No designer"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <p>{new Date(rental.start_date).toLocaleDateString()}</p>
                      <p className="text-xs">
                        to {new Date(rental.end_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          statusColors[rental.status] || statusColors.pending
                        }`}
                      >
                        {rental.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {rental.tracking_number && (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          Out: {rental.tracking_number}
                        </p>
                      )}
                      {rental.return_tracking_number && (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          Return: {rental.return_tracking_number}
                        </p>
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
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">No rentals yet.</p>
        </div>
      )}
    </div>
  );
}
