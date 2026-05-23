import { describe, it, expect } from "vitest";
import { STATUS_INFO, formatDateTime, localToISO, isoToLocal } from "../src/logic.js";

// ── STATUS_INFO ───────────────────────────────────────────────────────────────

describe("STATUS_INFO", () => {
  it("has entries for all four statuses", () => {
    for (const status of ["pending", "approved", "rejected", "cancelled"]) {
      expect(STATUS_INFO[status]).toBeDefined();
      expect(STATUS_INFO[status].cls).toBeTruthy();
      expect(STATUS_INFO[status].label).toBeTruthy();
    }
  });

  it("approved label contains a checkmark", () => {
    expect(STATUS_INFO.approved.label).toMatch(/✓/);
  });

  it("rejected label contains an X", () => {
    expect(STATUS_INFO.rejected.label).toMatch(/✗/);
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
