"use server";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { searchGlobal } from "./services";
import { requireInternalUser } from "@/lib/auth";

export const globalSearchAction = actionClient
  .schema(z.object({ query: z.string().min(2) }))
  .action(async ({ parsedInput: { query } }) => {
    await requireInternalUser();
    const results = await searchGlobal(query);
    return { results };
  });
