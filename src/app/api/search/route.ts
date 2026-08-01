import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, deals, projects, invoices } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query}%`;

    const [orgResults, dealResults, projectResults, invoiceResults] = await Promise.all([
      db.select({ id: organizations.id, title: organizations.name, type: organizations.type })
        .from(organizations)
        .where(ilike(organizations.name, searchTerm))
        .limit(5),
      
      db.select({ id: deals.id, title: deals.name, type: deals.stage })
        .from(deals)
        .where(ilike(deals.name, searchTerm))
        .limit(5),
        
      db.select({ id: projects.id, title: projects.name, type: projects.status })
        .from(projects)
        .where(ilike(projects.name, searchTerm))
        .limit(5),
        
      db.select({ id: invoices.id, title: invoices.invoiceNumber, type: invoices.status })
        .from(invoices)
        .where(ilike(invoices.invoiceNumber, searchTerm))
        .limit(5),
    ]);

    const results = [
      ...orgResults.map(o => ({ ...o, category: "Organization", href: `/sales/leads/${o.id}` })),
      ...dealResults.map(d => ({ ...d, category: "Deal", href: `/sales/deals/${d.id}` })),
      ...projectResults.map(p => ({ ...p, category: "Project", href: `/delivery/projects/${p.id}` })),
      ...invoiceResults.map(i => ({ ...i, category: "Invoice", href: `/finance` })),
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
