import re

with open("src/modules/sales/services.ts", "r", encoding="utf-8") as f:
    content = f.read()

top_imports = """
import { db } from "@/db";
import { proposals, deals, organizations, users, dealLineItems, websiteLeads, trackingEvents, contacts, services } from "@/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
"""

if 'import { db } from "@/db";' not in content[:500]:
    content = top_imports + "\n" + content

with open("src/modules/sales/services.ts", "w", encoding="utf-8") as f:
    f.write(content)
