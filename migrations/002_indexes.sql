CREATE INDEX IF NOT EXISTS idx_pa_permissions_child   ON app_parental_agreement__permissions(child_id);
CREATE INDEX IF NOT EXISTS idx_pa_permissions_status  ON app_parental_agreement__permissions(status);
CREATE INDEX IF NOT EXISTS idx_pa_activity_permission ON app_parental_agreement__activity(permission_id);
