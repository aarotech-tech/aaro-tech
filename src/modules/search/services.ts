import { db } from "@/db";
import { organizations, contacts, deals, projects } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: "organization" | "contact" | "deal" | "project";
  url: string;
};

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  const searchTerm = `%${query}%`;

  const [orgs, conts, dls, projs] = await Promise.all([
    db.query.organizations.findMany({
      where: ilike(organizations.name, searchTerm),
      limit: 5,
    }),
    db.query.contacts.findMany({
      where: or(ilike(contacts.name, searchTerm), ilike(contacts.email, searchTerm)),
      limit: 5,
    }),
    db.query.deals.findMany({
      where: ilike(deals.name, searchTerm),
      limit: 5,
    }),
    db.query.projects.findMany({
      where: ilike(projects.name, searchTerm),
      limit: 5,
    }),
  ]);

  const results: SearchResult[] = [];

  orgs.forEach((o: any) => results.push({
    id: o.id,
    title: o.name,
    subtitle: `Organization • ${o.status}`,
    type: "organization",
    url: `/directory/organizations/${o.id}`
  }));

  conts.forEach((c: any) => results.push({
    id: c.id,
    title: c.name,
    subtitle: `Contact • ${c.email}`,
    type: "contact",
    url: `/directory/contacts/${c.id}`
  }));

  dls.forEach((d: any) => results.push({
    id: d.id,
    title: d.name,
    subtitle: `Deal • ${d.stage}`,
    type: "deal",
    url: `/sales/deals/${d.id}`
  }));

  projs.forEach((p: any) => results.push({
    id: p.id,
    title: p.name,
    subtitle: `Project • ${p.status}`,
    type: "project",
    url: `/delivery/projects/${p.id}`
  }));

  return results;
}
