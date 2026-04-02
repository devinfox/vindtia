"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RentalCalendarProps = {
  productId: string;
  productName: string;
  pricePerRental: number;
  userTier: number;
  maxDuration: number;
  bookedDates: { start_date: string; end_date: string }[];
  canRent: boolean;
  rentalsRemaining: number | null;
  rentalWindowDays?: number;
};

export default function RentalCalendar({
  productId,
  productName,
  pricePerRental,
  userTier,
  maxDuration,
  bookedDates,
  canRent,
  rentalsRemaining,
  rentalWindowDays = 14,
}: RentalCalendarProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate min date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  // Auto-set end date based on max duration when start date is selected
  useEffect(() => {
    if (startDate && !endDate) {
      const suggestedEnd = new Date(startDate);
      suggestedEnd.setDate(suggestedEnd.getDate() + maxDuration - 1);
      setEndDate(suggestedEnd);
    }
  }, [startDate, maxDuration]);

  const isDateBooked = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return bookedDates.some((booking) => {
      return dateStr >= booking.start_date && dateStr <= booking.end_date;
    });
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelectable = (date: Date): boolean => {
    return date >= minDate && !isDateBooked(date);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;

    if (!startDate || (startDate && endDate)) {
      // Starting a new selection
      setStartDate(date);
      setEndDate(null);
    } else {
      // Completing selection
      if (date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        // Check if duration exceeds max
        const duration = Math.ceil(
          (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        if (duration > maxDuration) {
          setError(`Maximum rental duration is ${maxDuration} days for your tier.`);
          return;
        }

        // Check for booked dates in range
        const currentDate = new Date(startDate);
        while (currentDate <= date) {
          if (isDateBooked(currentDate)) {
            setError("Selected range includes unavailable dates.");
            return;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setEndDate(date);
        setError("");
      }
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding for days before the first of the month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const paddingDate = new Date(year, month, -i);
      days.push(paddingDate);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding for days after the last of the month
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const calculateTotalDays = (): number => {
    if (!startDate || !endDate) return 0;
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create rental");
      }

      // Redirect to checkout or confirmation
      router.push(`/checkout/${data.rental.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Select Rental Dates
      </h3>

      {/* Rental Limit Info */}
      {rentalsRemaining !== null && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {rentalsRemaining === 0
            ? `You've reached your rental limit for this ${rentalWindowDays}-day period.`
            : `${rentalsRemaining} rental${rentalsRemaining !== 1 ? "s" : ""} remaining (resets every ${rentalWindowDays} days)`}
        </p>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const prev = new Date(currentMonth);
            prev.setMonth(prev.getMonth() - 1);
            setCurrentMonth(prev);
          }}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-black dark:text-white"
        >
          ←
        </button>
        <span className="font-medium text-black dark:text-white">{monthName}</span>
        <button
          onClick={() => {
            const next = new Date(currentMonth);
            next.setMonth(next.getMonth() + 1);
            setCurrentMonth(next);
          }}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-black dark:text-white"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-2"
          >
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isBooked = isDateBooked(date);
          const isSelectable = isDateSelectable(date);
          const isInRange = isDateInRange(date);
          const isStart =
            startDate && date.toDateString() === startDate.toDateString();
          const isEnd =
            endDate && date.toDateString() === endDate.toDateString();

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!canRent || !isSelectable}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-md transition-colors
                ${!isCurrentMonth ? "text-zinc-300 dark:text-zinc-700" : ""}
                ${isBooked ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed" : ""}
                ${isSelectable && !isInRange ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white" : ""}
                ${isInRange && !isStart && !isEnd ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200" : ""}
                ${isStart || isEnd ? "bg-red-600 text-white" : ""}
                ${!isSelectable && !isBooked ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed" : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-600"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-zinc-200 dark:bg-zinc-700"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Selection Summary */}
      {startDate && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Start Date</span>
              <span className="text-black dark:text-white font-medium">
                {formatDateDisplay(startDate)}
              </span>
            </div>
            {endDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">End Date</span>
                  <span className="text-black dark:text-white font-medium">
                    {formatDateDisplay(endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Duration</span>
                  <span className="text-black dark:text-white font-medium">
                    {calculateTotalDays()} days
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Total</span>
                  <span className="text-black dark:text-white font-bold">
                    ${pricePerRental.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tier Duration Info */}
      <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4">
        Your tier allows rentals up to {maxDuration} days.
      </p>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
      )}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!canRent || !startDate || !endDate || loading}
        className="w-full px-6 py-3 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Processing..."
          : !canRent
          ? rentalsRemaining === 0
            ? "Rental limit reached"
            : "Upgrade to rent"
          : "Reserve This Piece"}
      </button>
    </div>
  );
}
