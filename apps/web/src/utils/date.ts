/**
 * Formats an ISO string, timestamp, or Date into a concise relative time string.
 * Examples: "now", "5m", "2h", "3d".
 */
export function formatRelativeTime(value: string | Date | number): string {
  const date =
    typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : value;
  const time = date.getTime();
  if (Number.isNaN(time)) return "";

  const diffMs = Date.now() - time;
  const ageMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (ageMinutes < 1) return "now";
  if (ageMinutes < 60) return `${ageMinutes}m`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours}h`;
  return `${Math.floor(ageHours / 24)}d`;
}
