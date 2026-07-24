CREATE UNIQUE INDEX IF NOT EXISTS "contacts_org_email_idx" ON "contacts" ("organization_id", "email");
