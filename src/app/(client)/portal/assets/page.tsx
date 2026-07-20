"use server";
import { db } from "@/db";
import { clientAssets, organizations, organizationMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { FileIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser, requireOrganizationAccess } from "@/lib/auth";

// Server action for MVP uploading
async function uploadMockAsset(formData: FormData) {
    const name = formData.get("name") as string;
  const orgId = formData.get("organizationId") as string;
  
  if (!name || !orgId) return;
  await requireOrganizationAccess(orgId);
  
  await db.insert(clientAssets).values({
    organizationId: orgId,
    name: name,
    fileType: "pdf",
    fileUrl: "#", // Mock URL
  });
  
  revalidatePath("/portal/assets");
}

export default async function ClientAssetsPage() {
  const user = await requireAuthenticatedUser();
  
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id)
  });

  if (!membership) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h3 className="text-xl font-medium text-white mb-2">No Active Organization</h3>
          <p>You have not been assigned to a client organization yet.</p>
        </div>
      </div>
    );
  }

  const myOrg = await db.query.organizations.findFirst({
    where: eq(organizations.id, membership.organizationId)
  });

  if (!myOrg) return null;

  const assets = await db.query.clientAssets.findMany({
    where: eq(clientAssets.organizationId, myOrg.id),
    orderBy: [desc(clientAssets.createdAt)]
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Assets</h1>
          <p className="text-gray-400 mt-2">Access your reports, invoices, and shared files.</p>
        </div>
        
        {/* Mock Upload Button (Usually only visible to Admins, but here for testing) */}
        <form action={uploadMockAsset} className="flex gap-2">
          <input type="hidden" name="organizationId" value={myOrg.id} />
          <input 
            type="text" 
            name="name" 
            placeholder="Document Name..." 
            className="bg-gray-800 border-gray-700 text-white rounded-md px-3 py-1.5 text-sm"
            required
          />
          <Button type="submit" variant="secondary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <UploadIcon className="w-4 h-4 mr-2" /> Upload Test File
          </Button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 border-b border-gray-800 text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Date Added</th>
              <th className="px-6 py-4 font-medium text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FileIcon className="w-12 h-12 mb-3 opacity-20" />
                    <p>Your library is currently empty.</p>
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center">
                    <FileIcon className="w-5 h-5 text-blue-400 mr-3" />
                    {asset.name}
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-semibold text-gray-500">{asset.fileType}</td>
                  <td className="px-6 py-4">{asset.createdAt?.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={asset.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-gray-400 hover:text-white hover:bg-gray-700"
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
  );
}
