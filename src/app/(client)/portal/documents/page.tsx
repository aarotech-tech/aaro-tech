import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Search, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";

export default async function ClientDocumentsPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  // Mocked for Epic 6 UI Scaffold. This would eventually query Delivery/Documents Service.
  const documents = [
    { id: "doc_1", name: "Master Services Agreement.pdf", category: "Contracts", size: "245 KB", uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: "doc_2", name: "Brand Guidelines v2.pdf", category: "Brand Assets", size: "4.2 MB", uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "doc_3", name: "Acme_Logo_Pack.zip", category: "Brand Assets", size: "12.8 MB", uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ];

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
            {documents.map(doc => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                      <span className="flex items-center"><Folder className="w-3 h-3 mr-1" /> {doc.category}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
