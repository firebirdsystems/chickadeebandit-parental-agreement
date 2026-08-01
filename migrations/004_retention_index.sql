-- retain_days sweep key for the permission activity log.
CREATE INDEX IF NOT EXISTS app_parental_agreement__activity_retention_idx
  ON app_parental_agreement__activity (created_at, id);
