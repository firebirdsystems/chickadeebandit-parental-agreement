-- Approval/denial decisions live in their own adult-writable table so a child
-- cannot self-approve. The `permissions` row stays owner-writable (child edits
-- and cancels their own request), but the authoritative approved/rejected state
-- is derived from the latest decision whose `decided_at` is at or after the
-- request's `updated_at` (so any child edit bumps updated_at and resets approval).
-- Row policy (manifest): adult_writable + member_read_column=child_id — only an
-- adult may INSERT a decision; a child reads only decisions for their OWN
-- requests (adults read all), preserving the app's per-child read privacy.
CREATE TABLE IF NOT EXISTS app_parental_agreement__decisions (
  id            TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  child_id      TEXT NOT NULL,
  decision      TEXT NOT NULL,
  note          TEXT NOT NULL DEFAULT '',
  decided_by    TEXT NOT NULL,
  decided_at    TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_pa_decisions_permission
  ON app_parental_agreement__decisions(permission_id);
