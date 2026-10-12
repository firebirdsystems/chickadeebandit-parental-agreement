import { describe, it, expect } from "vitest";
import { STATUS_INFO, formatDateTime, localToISO, isoToLocal, searchableFields, reviewsRequests, hasNoChildren } from "../src/logic.js";

// ── STATUS_INFO ───────────────────────────────────────────────────────────────

describe("STATUS_INFO", () => {
  it("has entries for all four statuses", () => {
    for (const status of ["pending", "approved", "rejected", "cancelled"]) {
      expect(STATUS_INFO[status]).toBeDefined();
      expect(STATUS_INFO[status].cls).toBeTruthy();
      expect(STATUS_INFO[status].label).toBeTruthy();
    }
  });

  it("approved carries a tick glyph", () => {
    expect(STATUS_INFO.approved.glyph).toBe("tick");
  });

  it("rejected carries a close glyph", () => {
    expect(STATUS_INFO.rejected.glyph).toBe("close");
  });
});

// ── formatDateTime ────────────────────────────────────────────────────────────

describe("formatDateTime", () => {
  it("returns an em-dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("")).toBe("—");
  });

  it("formats an ISO string to a readable date-time", () => {
    const result = formatDateTime("2025-06-15T14:30:00");
    expect(result).toMatch(/Jun 15, 2025/);
    expect(result).toMatch(/\d+:\d{2}/);
  });
});

// ── localToISO ────────────────────────────────────────────────────────────────

describe("localToISO", () => {
  it("returns empty string for falsy input", () => {
    expect(localToISO("")).toBe("");
    expect(localToISO(null)).toBe("");
  });

  it("converts a datetime-local value to an ISO string", () => {
    const result = localToISO("2025-06-15T14:30");
    expect(result).toMatch(/^2025-06-15T/);
    expect(result).toMatch(/\.000Z$|[+-]\d{2}:\d{2}$/);
  });
});

// ── isoToLocal ────────────────────────────────────────────────────────────────

describe("isoToLocal", () => {
  it("returns empty string for falsy input", () => {
    expect(isoToLocal("")).toBe("");
    expect(isoToLocal(null)).toBe("");
  });

  it("produces a YYYY-MM-DDTHH:MM string from ISO", () => {
    const result = isoToLocal("2025-06-15T14:30:00Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("localToISO and isoToLocal roundtrip within the same timezone", () => {
    const local = "2025-06-15T14:30";
    const iso   = localToISO(local);
    const back  = isoToLocal(iso);
    expect(back).toBe(local);
  });
});

describe("searchableFields", () => {
  it("matches on the ask and the decision note", () => {
    const fields = searchableFields({ title: "Sleepover", description: "at Kit's on Friday", note: "ok if home by 10" });
    expect(fields).toContain("at Kit's on Friday");
    expect(fields).toContain("ok if home by 10");
  });
});

// ── reviewsRequests ───────────────────────────────────────────────────────────

describe("reviewsRequests", () => {
  const adult = { id: "a1", role: "adult" };
  const child = { id: "c1", role: "child" };

  it("any adult reviews in a household, which is the default", () => {
    expect(reviewsRequests(adult)).toBe(true);
    expect(reviewsRequests(adult, { tenantKind: "household", isAdmin: false })).toBe(true);
    expect(reviewsRequests(child)).toBe(false);
    expect(reviewsRequests(null)).toBe(false);
  });

  it("only the steward reviews in a shared space", () => {
    expect(reviewsRequests(adult, { tenantKind: "shared_space", isAdmin: false })).toBe(false);
    expect(reviewsRequests(adult, { tenantKind: "shared_space", isAdmin: true })).toBe(true);
  });

  it("being a household's admin does not make a child a reviewer", () => {
    expect(reviewsRequests(child, { tenantKind: "household", isAdmin: true })).toBe(false);
  });
});

// ── hasNoChildren ─────────────────────────────────────────────────────────────

describe("hasNoChildren", () => {
  it("is true for a loaded list of adults only", () => {
    expect(hasNoChildren([{ id: "a1", role: "adult" }, { id: "a2", role: "admin" }])).toBe(true);
  });

  it("is false once any member is not an adult", () => {
    expect(hasNoChildren([{ id: "a1", role: "adult" }, { id: "c1", role: "child" }])).toBe(false);
  });

  it("is false for an empty list, which means the members did not load", () => {
    expect(hasNoChildren([])).toBe(false);
  });
});
