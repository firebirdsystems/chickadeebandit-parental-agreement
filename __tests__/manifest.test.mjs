import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, it, expect } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "../manifest.json"), "utf-8"));

const VALID_STORAGE   = ["kv", "db", "none"];
const VALID_AUDIENCES = ["everyone", "adults", "children"];

describe("manifest.json", () => {
  it("has required string fields", () => {
    for (const field of ["id", "name", "version", "description", "entrypoint", "runtime", "icon"]) {
      expect(manifest[field], `missing field: ${field}`).toBeTruthy();
    }
  });

  it("entrypoint is index.html", () => expect(manifest.entrypoint).toBe("index.html"));
  it("runtime is static",        () => expect(manifest.runtime).toBe("static"));

  it("storage is declared and valid", () => {
    expect(manifest.storage, "storage field is required").toBeTruthy();
    expect(VALID_STORAGE).toContain(manifest.storage);
  });

  it("version follows semver", () => expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/));

  it("permissions.default_audience is valid", () => {
    expect(VALID_AUDIENCES).toContain(manifest.permissions.default_audience);
  });

  it("permissions.requires_approval is boolean", () => {
    expect(typeof manifest.permissions.requires_approval).toBe("boolean");
  });

  it("data_access has reads and writes arrays", () => {
    expect(Array.isArray(manifest.data_access.reads)).toBe(true);
    expect(Array.isArray(manifest.data_access.writes)).toBe(true);
  });

  it("declares row_policies for sensitive tables", () => {
    expect(manifest.row_policies).toBeDefined();
    // Row-policy keys must be the table name WITHOUT the app_<id>__ prefix — the
    // hub looks them up by the prefix-stripped name, so a prefixed key is a
    // silently dead (unenforced) policy.
    expect(manifest.row_policies["permissions"]).toBeDefined();
    expect(manifest.row_policies["decisions"]).toBeDefined();
    expect(manifest.row_policies["activity"]).toBeDefined();
    for (const key of Object.keys(manifest.row_policies)) {
      expect(key.startsWith("app_parental_agreement__")).toBe(false);
    }
  });

  // A request approved and then rejected is not approved: the agenda lists a
  // request only when no rejection follows the approval it matched.
  it("agenda lists a request by its LATEST decision, not any approved one", () => {
    const sql = manifest.agenda.source.query;
    expect(sql).toMatch(/^(SELECT|WITH) /);
    expect(sql).not.toMatch(/;|NULLS LAST|date\('now'\)/i);
    expect(sql).toContain("= :today");
    expect(sql).toContain("LEFT JOIN app_parental_agreement__decisions d2 ON d2.permission_id = p.id AND d2.decided_at >= d.decided_at AND d2.decision != 'approved'");
    expect(sql).toContain("AND p.status != 'cancelled' AND d2.id IS NULL");
    // scenarios.json replays this statement through api/db with the day bound
    // as a parameter; a drifted copy would test a statement nobody runs.
    const scenarios = JSON.parse(readFileSync(join(__dirname, "../scenarios.json"), "utf-8")).scenarios;
    const copies = scenarios.flatMap((s) => s.steps).filter((st) => st.action === "db" && st.sql.includes(" d2 "));
    expect(copies.length).toBeGreaterThan(0);
    for (const st of copies) expect(st.sql).toBe(sql.replace(":today", "?"));
  });

  // The stored status stays 'pending' after a parent answers (approval lives
  // in the decisions table), so the badge must leave answered requests out,
  // as the widget does.
  it("badge counts only requests with no decision since their last edit", () => {
    const sql = manifest.glance.source.query;
    expect(sql).toMatch(/^SELECT /);
    expect(sql).not.toMatch(/;/);
    expect(sql).toContain("LEFT JOIN app_parental_agreement__decisions d ON d.permission_id = p.id AND d.decided_at >= p.updated_at");
    expect(sql).toContain("WHERE p.status = 'pending' AND d.id IS NULL");
  });

  it("declares publish_acls for value-bearing events", () => {
    expect(manifest.publish_acls).toBeDefined();
    expect(manifest.publish_acls["parental-agreement.approved"]).toBeDefined();
    expect(manifest.publish_acls["parental-agreement.rejected"]).toBeDefined();
  });
});
