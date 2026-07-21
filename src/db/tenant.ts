import { db } from "./index";
import { and, eq, isNull, SQLWrapper } from "drizzle-orm";
import { getAuthContext } from "@/lib/authorize";

type PgTableWithOrgAndDeleted = any; // We'd strongly type this if we mapped all tables, using any for now to represent generic Drizzle tables with these fields.

/**
 * Creates a scoped query filter for a specific organization, 
 * automatically enforcing soft deletes and tenant isolation.
 */
export async function withTenantContext(table: PgTableWithOrgAndDeleted) {
  const context = await getAuthContext();
  
  if (!context || !context.orgId) {
    throw new Error("No organization context found");
  }

  return and(
    eq(table.organizationId, context.orgId),
    isNull(table.deletedAt)
  );
}

/**
 * Example wrapper for a find query
 */
export async function findManyScoped(table: PgTableWithOrgAndDeleted, additionalWhere?: SQLWrapper) {
  const scope = await withTenantContext(table);
  const where = additionalWhere ? and(scope, additionalWhere) : scope;
  
  return db.select().from(table).where(where);
}
