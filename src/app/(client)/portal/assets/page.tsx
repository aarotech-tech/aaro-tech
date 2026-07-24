
import { auth } from "@clerk/nextjs/server";
import { FileIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/ui/page-header";
import { requireAuthenticatedUser, requireOrganizationAccess } from "@/lib/auth";
import { portalService } from "@/modules/portal/services";

import { UploadDropzone } from "@/lib/uploadthing";
import { CoreService } from "@/modules/core/services";

export default async function ClientAssetsPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);
  
  if (!membershipData || !membershipData.myOrg) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Organization</h3>
          <p>You have not been assigned to a client organization yet.</p>
        </div>
      </div>
    );
  }

  const { myOrg } = membershipData;
  const assets = await CoreService.getOrganizationFiles(myOrg.id);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="My Assets"
          description="Access your reports, invoices, and shared files."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Assets" }
          ]}
          primaryAction={
            <div className="w-[300px]">
              <UploadDropzone
                endpoint="assetUploader"
                input={{ organizationId: myOrg.id }}
                onClientUploadComplete={() => {
                  "use client";
                  window.location.reload();
                }}
                onUploadError={(error: Error) => {
                  "use client";
                  alert(`Upload Error: ${error.message}`);
                }}
                appearance={{
                  container: "p-2 min-h-0 min-w-0 border-indigo-200 bg-indigo-50/50",
                  button: "hidden",
                  label: "text-xs font-medium text-indigo-700",
                }}
              />
            </div>
          }
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Name</th>
                <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Type</th>
                <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Date Added</th>
                <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileIcon className="w-12 h-12 mb-3 text-gray-300" />
                      <p>Your library is currently empty.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center text-gray-900">
                      <FileIcon className="w-5 h-5 text-indigo-500 mr-3" />
                      {asset.name}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold text-gray-500">{asset.mimeType || 'FILE'}</td>
                    <td className="px-6 py-4">{asset.createdAt ? new Date(asset.createdAt as any).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={asset.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 h-9 px-3 text-gray-500"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
