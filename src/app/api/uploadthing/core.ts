import { logger } from '@/lib/logger';
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { requireAuthenticatedUser } from "@/lib/auth";

import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  projectUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    video: { maxFileSize: "256MB", maxFileCount: 1 }
  })
    .input(z.object({ 
      projectId: z.string().optional(),
      retainerPeriodId: z.string().optional()
    }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      
      const { rateLimit } = await import("@/lib/rate-limit");
      // Since UploadThing wraps NextRequest, we extract IP manually if possible, or fallback
      const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "unknown";
      try {
        await rateLimit.check(`upload_${ip}`, { points: 20, durationInSeconds: 3600 });
      } catch (e) {
        throw new UploadThingError("Too many requests");
      }

      const user = await requireAuthenticatedUser().catch(() => null);
      
      if (!user) throw new UploadThingError("Unauthorized");

      if (!input.projectId && !input.retainerPeriodId) {
        throw new UploadThingError("Must provide projectId or retainerPeriodId");
      }

      let derivedOrganizationId: string | null = null;
      const { CoreService } = await import("@/modules/core/services");
      
      derivedOrganizationId = await CoreService.getDerivedOrganizationId(input.projectId, input.retainerPeriodId);

      if (!derivedOrganizationId) throw new UploadThingError("Could not derive organization ID");

      // We must verify the user belongs to the derived target organization before upload
      const { requireOrganizationMember } = await import("@/lib/auth");
      
      try {
        await requireOrganizationMember(derivedOrganizationId);
      } catch (e: any) {
        throw new UploadThingError(e.message || "Forbidden");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { 
        userId: user.id, 
        organizationId: derivedOrganizationId,
        projectId: input.projectId,
        retainerPeriodId: input.retainerPeriodId
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      logger.info({ userId: metadata.userId, org: metadata.organizationId }, "Upload complete");
      
      const { CoreService } = await import("@/modules/core/services");
      await CoreService.saveUploadedFile(metadata, file);

      return { uploadedBy: metadata.userId, fileUrl: file.url, fileKey: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
