# Database Guide

## Neon & Drizzle
We use Neon's serverless Postgres. The schema is defined in `src/db/schema.ts`.

## Migrations & Launch Readiness
> [!IMPORTANT]
> **Migration Verification Protocols**
> - **History Committed**: Always commit the `drizzle` folder output containing SQL migrations.
> - **Rollback Tested**: Test down migrations locally before pushing.
> - **Staging Verification**: Before running a production migration, test the migration on a staging branch/database with cloned data.
> - **Restore Tested**: Familiarize yourself with Neon's Point-in-Time Recovery (PITR) in case a migration destroys data.

Run `npx drizzle-kit push` for local dev, and use the migration runner for production if needed.