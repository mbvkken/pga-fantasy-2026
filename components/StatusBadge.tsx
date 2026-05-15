import type { GolferStatus } from "@/lib/types";

const LABELS: Record<GolferStatus, string> = {
  not_started: "Not started",
  active: "Playing",
  cut: "MC",
  wd: "WD",
  dq: "DQ",
  finished: "Done",
};

const STYLES: Record<GolferStatus, string> = {
  not_started: "bg-zinc-700/60 text-zinc-200",
  active: "bg-emerald-900/50 text-emerald-200",
  cut: "bg-amber-900/50 text-amber-200",
  wd: "bg-orange-900/50 text-orange-200",
  dq: "bg-red-900/50 text-red-200",
  finished: "bg-sky-900/50 text-sky-200",
};

export function StatusBadge({ status }: { status: GolferStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
