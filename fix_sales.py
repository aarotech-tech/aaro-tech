import re

with open('src/modules/sales/services.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports to top
top_imports = """
import { db } from "@/db";
import { proposals, deals, organizations, users, dealLineItems, websiteLeads, trackingEvents, contacts, services } from "@/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
"""

if 'import { db } from "@/db";' not in content[:500]:
    content = re.sub(r'(import \{ AppError \} from "@/lib/errors";)', r'\1\n' + top_imports.strip(), content, count=1)

# Remove the duplicate import block if it exists
dup_block = 'import { db } from "@/db";\nimport { proposals, deals, organizations } from "@/db/schema";\nimport { eq } from "drizzle-orm";'
content = content.replace(dup_block, '')

# Remove `require` statements safely line by line
lines = content.split('\n')
new_lines = []
for line in lines:
    if 'require(' in line and 'const {' in line:
        continue
    if 'require("crypto")' in line or "require('crypto')" in line:
        continue
    new_lines.append(line)

content = '\n'.join(new_lines)

# Now, update `updateDealDetailsService` to accept organizationId and check it
content = re.sub(
    r'export async function updateDealDetailsService\(data: \{\s*dealId: string;\s*name: string;\s*value: number;\s*expectedCloseDate\?: string \| null;\s*userId: string;\s*\}\)',
    'export async function updateDealDetailsService(data: {\n  dealId: string;\n  organizationId: string;\n  name: string;\n  value: number;\n  expectedCloseDate?: string | null;\n  userId: string;\n})',
    content
)

old_body = """
  const [updated] = await db.update(deals)
    .set({
      name: data.name,
      value: data.value,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      updatedBy: data.userId,
    })
    .where(eq(deals.id, data.dealId))
    .returning();
"""
new_body = """
  const deal = await db.query.deals.findFirst({ where: eq(deals.id, data.dealId) });
  if (!deal || deal.organizationId !== data.organizationId) {
    throw new Error("Unauthorized or Deal not found");
  }

  const [updated] = await db.update(deals)
    .set({
      name: data.name,
      value: data.value,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      updatedBy: data.userId,
    })
    .where(eq(deals.id, data.dealId))
    .returning();
"""
if 'deal.organizationId !== data.organizationId' not in content:
    content = content.replace(old_body.strip(), new_body.strip())

with open('src/modules/sales/services.ts', 'w', encoding='utf-8') as f:
    f.write(content)
