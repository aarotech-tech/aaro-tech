import { db } from "@/db";
import { organizations, contacts, clientOnboardings, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import OnboardingManager from "./_components/OnboardingManager";
import { BuildingIcon, PhoneIcon, MailIcon } from "lucide-react";

export default async function ClientProfilePage({ params }: { params: Promise<{ clientId: string }> }) {
  const resolvedParams = await params;
  const clientId = resolvedParams.clientId;

  // 1. Fetch Organization
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, clientId)
  });

  if (!org) {
    notFound();
  }

  // 2. Fetch Contacts
  const orgContacts = await db.query.contacts.findMany({
    where: eq(contacts.organizationId, clientId)
  });

  // 3. Fetch Onboarding
  const onboarding = await db.query.clientOnboardings.findFirst({
    where: eq(clientOnboardings.organizationId, clientId),
    with: {
      steps: true
    }
  });

  // 4. Fetch Projects
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, clientId)
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
          <BuildingIcon className="w-8 h-8 mr-3 text-blue-600" />
          {org.name}
        </h1>
        <p className="text-sm text-gray-500 mt-2 flex space-x-4">
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {org.type}
          </span>
          <span className="text-gray-400">Created {org.createdAt?.toLocaleDateString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Onboarding Section */}
          {onboarding && (
            <OnboardingManager clientId={clientId} steps={onboarding.steps} />
          )}

          {/* Active Projects */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Projects</h3>
            {orgProjects.length === 0 ? (
              <p className="text-gray-500 text-sm">No active projects found.</p>
            ) : (
              <div className="space-y-4">
                {orgProjects.map(project => (
                  <div key={project.id} className="border border-gray-100 p-4 rounded-lg hover:border-blue-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Status: {project.status}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.health === 'green' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {project.health}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Contacts Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contacts</h3>
            {orgContacts.length === 0 ? (
              <p className="text-gray-500 text-sm">No contacts associated.</p>
            ) : (
              <div className="space-y-6">
                {orgContacts.map(contact => (
                  <div key={contact.id} className="flex flex-col">
                    <span className="font-semibold text-gray-900">{contact.name}</span>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
