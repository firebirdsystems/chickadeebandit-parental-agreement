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

  it("declares publish_acls for value-bearing events", () => {
    expect(manifest.publish_acls).toBeDefined();
    expect(manifest.publish_acls["parental-agreement.approved"]).toBeDefined();
    expect(manifest.publish_acls["parental-agreement.rejected"]).toBeDefined();
  });
});
