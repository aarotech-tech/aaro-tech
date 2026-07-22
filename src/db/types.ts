import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NeonHttpQueryResultHKT } from "drizzle-orm/neon-http";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "./schema";

export type DbTx = PgTransaction<NeonHttpQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>> | any;
