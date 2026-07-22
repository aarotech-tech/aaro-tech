import { notFound } from "next/navigation";
import { Building2, Mail, Phone, MapPin, Target, Briefcase, FileText, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CoreService } from "@/modules/core/services";

export default async function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const details = await CoreService.getOrganizationDetails(params.id);

  if (!details) {
    notFound();
  }

  const { org, orgContacts, orgDeals, orgProjects, orgInvoices } = details;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title={org.name}
          description={`${org.city || ''}${org.city && org.country ? ', ' : ''}${org.country || ''}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Directory", href: "/directory/organizations" },
            { label: "Organizations", href: "/directory/organizations" },
            { label: org.name }
          ]}
          kpiBadges={
            <div className="flex items-center space-x-2">
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-700 text-sm">{org.type}</span>
              <span className="capitalize px-2 py-0.5 bg-green-100 rounded-md font-medium text-green-700 text-sm">{org.status}</span>
            </div>
          }
        />
      </div>

      <div className="flex-1 p-6 pt-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details & Contacts */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Organization Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-gray-500 font-medium">Tax ID</dt>
                <dd className="col-span-2 text-gray-900">{org.taxId || "Not provided"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-gray-500 font-medium">Health</dt>
                <dd className="col-span-2 text-gray-900">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${org.healthScore || 0}%` }}></div>
                    </div>
                    {org.healthScore}%
                  </div>
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-gray-500 font-medium">Created</dt>
                <dd className="col-span-2 text-gray-900">{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center justify-between">
              Contacts
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{orgContacts.length}</span>
            </h3>
            <div className="space-y-4">
              {orgContacts.map(contact => (
                <div key={contact.id} className="flex flex-col border border-gray-100 p-3 rounded-md">
                  <span className="font-medium text-gray-900">{contact.name}</span>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    <a href={`mailto:${contact.email}`} className="hover:text-blue-600 transition-colors">{contact.email}</a>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      {contact.phone}
                    </div>
                  )}
                </div>
              ))}
              {orgContacts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No contacts added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Related Entities */}
        <div className="space-y-6 md:col-span-2">
          {/* Deals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-indigo-500" /> Deals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orgDeals.map(deal => (
                <div key={deal.id} className="border border-gray-200 rounded-md p-4 hover:border-indigo-300 transition-colors">
                  <div className="font-medium text-gray-900">{deal.name}</div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="capitalize px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium text-xs">{deal.stage}</span>
                    <span className="text-gray-600 font-medium">${(deal.value || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {orgDeals.length === 0 && <p className="text-sm text-gray-500 col-span-2">No deals found.</p>}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-500" /> Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orgProjects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded-md p-4 hover:border-purple-300 transition-colors">
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="capitalize px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium text-xs">{project.status}</span>
                  </div>
                </div>
              ))}
              {orgProjects.length === 0 && <p className="text-sm text-gray-500 col-span-2">No active projects.</p>}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-500" /> Invoices
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orgInvoices.map(invoice => (
                <div key={invoice.id} className="border border-gray-200 rounded-md p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">${((invoice.amount || 0) / 100).toLocaleString()}</span>
                    <span className={`capitalize px-2 py-0.5 rounded-md font-medium text-xs ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1" /> Due {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {orgInvoices.length === 0 && <p className="text-sm text-gray-500 col-span-2">No invoices found.</p>}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
