import { db } from "@/db";
import { contacts, organizations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import AddContactModal from "./_components/AddContactModal";

export default async function ContactsPage() {
  const allContacts = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      phone: contacts.phone,
      createdAt: contacts.createdAt,
      organizationName: organizations.name,
    })
    .from(contacts)
    .innerJoin(organizations, eq(contacts.organizationId, organizations.id))
    .orderBy(desc(contacts.createdAt));
    
  const allOrgs = await db.query.organizations.findMany({
    orderBy: [desc(organizations.createdAt)]
  });

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Global Contacts</h2>
          <p className="text-sm text-gray-500 mt-1">Directory of all people across your leads and clients.</p>
        </div>
        <AddContactModal organizations={allOrgs} />
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium">Organization</th>
              <th className="px-6 py-4 font-medium text-right">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No contacts found.
                </td>
              </tr>
            ) : (
              allContacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-blue-600 hover:underline">{c.email}</td>
                  <td className="px-6 py-4 text-gray-500">{c.phone || "—"}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{c.organizationName}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{c.createdAt?.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
