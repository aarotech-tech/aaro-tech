import { requireAuthenticatedUser } from "@/lib/auth";
import { db } from "@/db";
import { organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getClientDeliverables } from "@/modules/delivery/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Download, History, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function ClientReviewsPage() {
  const user = await requireAuthenticatedUser();
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id)
  });

  if (!membership) redirect("/onboarding");
  const deliverables = await getClientDeliverables(membership.organizationId);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Reviews & Approvals"
          description="Review, request changes, or approve project deliverables."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Reviews" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full space-y-6">

      <div className="space-y-6">
        {deliverables.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <FileCheck className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No pending reviews</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up with your deliverables.</p>
          </div>
        ) : (
          deliverables.map(del => (
            <Card key={del.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 pb-4">
                <div>
                  <CardTitle className="text-lg text-indigo-900">{del.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Project: {del.projectName}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Download</Button>
                  <Button variant="outline" size="sm"><History className="w-4 h-4 mr-2" /> Versions</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="aspect-video bg-gray-100 rounded-md border flex items-center justify-center text-gray-400">
                      Deliverable Preview
                    </div>
                  </div>
                  <div className="w-full md:w-72 space-y-4">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Check className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" className="w-full text-amber-700 hover:bg-amber-50 hover:text-amber-800 border-amber-200">
                      <X className="w-4 h-4 mr-2" /> Request Changes
                    </Button>
                    <Button variant="outline" className="w-full text-blue-700 hover:bg-blue-50 hover:text-blue-800 border-blue-200">
                      <MessageSquare className="w-4 h-4 mr-2" /> Leave Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </div>
  );
}
