import { notFound } from "next/navigation";
import { Building2, Mail, Phone, MapPin, Target, Briefcase, FileText, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CoreService } from "@/modules/core/services";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireInternalUser } from "@/lib/auth";
import { EditOrganizationDialog } from "../_components/EditOrganizationDialog";
import { ArchiveOrganizationDialog } from "../_components/ArchiveOrganizationDialog";
import { AddContactDialog } from "../_components/AddContactDialog";
import { EditContactDialog } from "../_components/EditContactDialog";
import { ArchiveContactDialog } from "../_components/ArchiveContactDialog";
import { InviteClientDialog } from "../_components/InviteClientDialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Archive, Send, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await CoreService.getOrganizationDetails(id);

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
          secondaryActions={
            <>
              <InviteClientDialog organizationId={org.id}>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" /> Invite Client
                </Button>
              </InviteClientDialog>
              <EditOrganizationDialog organizationId={org.id} initialName={org.name}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </EditOrganizationDialog>
              <ArchiveOrganizationDialog organizationId={org.id} organizationName={org.name}>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Archive className="h-4 w-4 mr-2" /> Archive
                </Button>
              </ArchiveOrganizationDialog>
            </>
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
              <div>
                Contacts
                <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{orgContacts.length}</span>
              </div>
              <AddContactDialog>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </AddContactDialog>
            </h3>
            <div className="space-y-4">
              {orgContacts.map(contact => (
                <div key={contact.id} className="flex flex-col border border-gray-100 p-3 rounded-md relative group">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900">{contact.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EditContactDialog contact={contact}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </EditContactDialog>
                        <ArchiveContactDialog contactId={contact.id} contactName={contact.name}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Archive</span>
                          </DropdownMenuItem>
                        </ArchiveContactDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
              {orgDeals.length === 0 && (
                <div className="col-span-1 sm:col-span-2">
                  <EmptyState icon={Target} title="No deals" description="No deals found." className="py-6" />
                </div>
              )}
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
              {orgProjects.length === 0 && (
                <div className="col-span-1 sm:col-span-2">
                  <EmptyState icon={Briefcase} title="No projects" description="No active projects." className="py-6" />
                </div>
              )}
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
              {orgInvoices.length === 0 && (
                <div className="col-span-1 sm:col-span-2">
                  <EmptyState icon={CreditCard} title="No invoices" description="No invoices found." className="py-6" />
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
