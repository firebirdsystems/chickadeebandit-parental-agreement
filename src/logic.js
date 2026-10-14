/**
 * Pure business logic for the Parental Agreement app.
 * No DOM, no fetch — importable in both browser and test environments.
 */

export const STATUS_INFO = {
  pending:   { cls: "status-pending",   label: "Pending" },
  approved:  { cls: "status-approved",  label: "Approved", glyph: "tick" },
  rejected:  { cls: "status-rejected",  label: "Rejected", glyph: "close" },
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

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The description is the ask, and the note is the answer — both are
 * what a past request gets looked up by.
 */
export function searchableFields(item) {
  return [item.title, item.description, item.note];
}

// The hub's own test for an adult member (hub-sdk `isAdult`), repeated here so
// the role rules below can be unit-tested without the browser-only SDK.
function isAdultMember(member) {
  return !!member && (member.role === "adult" || member.role === "admin");
}

/**
 * Whether a member reviews other members' requests. Mirrors the hub's rule for
 * the permissions and decisions tables: any adult in a household, and only the
 * steward in a shared space. An adult who merely takes part in a space reads
 * nobody else's requests, so a review screen offered to them would stay empty.
 */
export function reviewsRequests(member, { tenantKind = "household", isAdmin = false } = {}) {
  return tenantKind === "household" ? isAdultMember(member) : isAdmin === true;
}

/**
 * True when the member list loaded and holds no child. Requests start from a
 * child, so without one there is nothing this app can do. An empty list means
 * the members could not be read, which says nothing either way.
 */
export function hasNoChildren(members) {
  return members.length > 0 && !members.some(m => !isAdultMember(m));
}

/**
 * Whether a failed write may have been stored and only its answer lost: no
 * HTTP status at all (the request threw), a 400 (the hub answers one for a
 * write that timed out), or a 5xx other than 507. A 403, a 507 and a 409 are
 * clean refusals. The caller re-reads by the id or stamp it kept to decide.
 */
export function outcomeUnknown(e) {
  return e?.status == null || e.status === 400 || (e.status >= 500 && e.status !== 507);
}

/**
 * Whether a stored row differs from the given values, over those keys only.
 * An empty value and a missing one are the same; no row differs from any.
 */
export function storedDiffers(row, fields) {
  return !row || Object.keys(fields).some(k => (row[k] ?? null) !== (fields[k] ?? null));
}
