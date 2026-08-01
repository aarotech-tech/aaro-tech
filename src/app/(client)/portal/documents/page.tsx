import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Search, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { CoreService } from "@/modules/core/services";

export default async function ClientDocumentsPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const documents = await CoreService.getOrganizationFiles(membershipData.myOrg.id);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Documents"
          description="Access contracts, project files, and final deliverables."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Documents" }
          ]}
        />
        <FilterBar 
          searchPlaceholder="Search documents..." 
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y">
            {documents.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No documents found.</div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                        <span className="flex items-center"><Folder className="w-3 h-3 mr-1" /> {doc.mimeType || 'Document'}</span>
                        <span>•</span>
                        <span>{doc.size ? Math.round(Number(doc.size) / 1024) + ' KB' : 'Unknown size'}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
