"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';
import { db } from "@/db";
import { projects, files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireInternalUser } from "@/lib/auth";
import { UTApi } from "uploadthing/server";

export async function archiveProject(projectId: string) {
  return withActionErrorHandling('archiveProject', async () => {
    await requireInternalUser();
    
    const utapi = new UTApi();

    // 1. Get project
    const projData = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!projData[0]) throw new AppError("Project not found", 404);

    // 2. Mark project as archived/completed
    await db.update(projects)
      .set({ status: "completed" }) // or whatever the archived status is
      .where(eq(projects.id, projectId));

    // 3. Find associated files
    const projectFiles = await db.select().from(files).where(eq(files.projectId, projectId));
    
    const fileKeys = projectFiles
      .map(f => f.key)
      .filter(key => key !== null) as string[];

    // 4. Delete physically from UploadThing
    if (fileKeys.length > 0) {
      try {
        await utapi.deleteFiles(fileKeys);
        console.log(`[UploadThing] Deleted ${fileKeys.length} files for archived project ${projectId}`);
      } catch (error) {
        console.error("[UploadThing] Error deleting files:", error);
        // Non-fatal, we continue to archive the project
      }
    }
    
    // 5. Delete records from database
    if (fileKeys.length > 0) {
      await db.delete(files).where(eq(files.projectId, projectId));
    }

    revalidatePath("/crm/projects");
    revalidatePath(`/crm/projects/${projectId}`);
    return true;
  });
}
