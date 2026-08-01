import { db } from "@/db";
import { contacts, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { ContactsTable } from "./ContactsTable";

export default async function ContactsDirectoryPage() {
  const allContacts = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      phone: contacts.phone,
      organizationId: contacts.organizationId,
      organizationName: organizations.name,
    })
    .from(contacts)
    .leftJoin(organizations, eq(contacts.organizationId, organizations.id))
    .orderBy(desc(contacts.createdAt));

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-gray-50">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Global Contacts"
          description="View all client contacts across all organizations in one place."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Directory", href: "/directory/organizations" },
            { label: "Contacts" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-6 flex-1">
        <ContactsTable contacts={allContacts} />
      </div>
    </div>
  );
}
