CREATE TABLE IF NOT EXISTS app_parental_agreement__permissions (
  id            TEXT NOT NULL,
  child_id      TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  from_datetime TEXT NOT NULL,
  to_datetime   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  approved_by   TEXT,
  approved_at   TEXT,
  approval_note TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS app_parental_agreement__activity (
  id            TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  action        TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  PRIMARY KEY (id)
);
