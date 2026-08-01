import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

export default async function ClientProposalsPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }

  const proposals = await portalService.getClientProposals(membershipData.myOrg.id);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Proposals"
          description="Review your active proposals and statements of work."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Proposals" }
          ]}
        />
      </div>

      <div className="p-6 pt-6 flex-1 max-w-6xl mx-auto w-full">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {proposals.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No proposals found.</div>
              ) : (
                proposals.map(proposal => (
                  <div key={proposal.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">Proposal for {(proposal.deal as any)?.name || "Deal"}</h4>
                          <Badge variant={proposal.status === 'accepted' ? 'default' : proposal.status === 'sent' ? 'secondary' : 'outline'} className="capitalize text-xs">
                            {proposal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                          <span className="flex items-center"><Folder className="w-3 h-3 mr-1" /> Proposal</span>
                          <span>•</span>
                          <span>{new Date(proposal.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {proposal.pdfUrl ? (
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          <a href={proposal.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-gray-400" disabled>
                          <Download className="w-4 h-4 mr-2" /> Not Available
                        </Button>
                      )}
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
