import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { FileText, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProjectFilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const projectFiles = await db.query.files.findMany({
    where: eq(files.projectId, id),
    orderBy: [desc(files.createdAt)],
    with: {
      uploadedBy: true
    }
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
          <p className="text-sm text-gray-500">All deliverables, assets, and documents for this project.</p>
        </div>
        <Button size="sm">
          <Upload className="h-4 w-4 mr-2" /> Upload File
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {projectFiles.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectFiles.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.uploadedBy?.firstName} {file.uploadedBy?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.createdAt || "").toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-blue-600 h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No files uploaded yet.</p>
            <p className="text-sm mt-1">Upload project assets, documents, and deliverables here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
