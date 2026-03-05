import { calcDays, todayISO } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className,
}: DateRangePickerProps) {
  const today = todayISO();
  const days = calcDays(startDate, endDate);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => {
              const newStart = e.target.value;
              onStartChange(newStart);
              if (newStart >= endDate) {
                const next = new Date(newStart);
                next.setDate(next.getDate() + 1);
                onEndChange(next.toISOString().slice(0, 10));
              }
            }}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            End date
          </span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        {days} day{days !== 1 ? "s" : ""} rental
      </p>
    </div>
  );
}
