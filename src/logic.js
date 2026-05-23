/**
 * Pure business logic for the Parental Agreement app.
 * No DOM, no fetch — importable in both browser and test environments.
 */

export const STATUS_INFO = {
  pending:   { cls: "status-pending",   label: "Pending" },
  approved:  { cls: "status-approved",  label: "✓ Approved" },
  rejected:  { cls: "status-rejected",  label: "✗ Rejected" },
  cancelled: { cls: "status-cancelled", label: "Cancelled" },
};

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export function localToISO(local) {
  if (!local) return "";
  return new Date(local).toISOString();
}

export function isoToLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
