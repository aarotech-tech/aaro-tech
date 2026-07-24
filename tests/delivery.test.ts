import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db";
import { users, organizations, deals, projects, tasks, deliverables, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createProjectAction, approveDeliverableAction, requestRevisionAction } from "@/modules/delivery/actions";
import { eventBus } from "@/modules/core/events";
import crypto from "crypto";

const rand = () => crypto.randomBytes(4).toString("hex");

// Mock Clerk
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Delivery Engine - Milestone 4", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Internal Project Creation & Event Bus", () => {
    it("Internal user can manually create a project from a Deal, spawning default tasks and emitting event", async () => {
      const uId = rand();
      
      const [internalUser] = await db.insert(users).values({
        clerkId: `staff_${uId}`, email: `staff_${uId}@aarotech.in`, userType: "internal"
      }).returning();

      const [org] = await db.insert(organizations).values({ name: "Delivery Org", clerkOrgId: `org_${uId}`, slug: `org_${uId}` }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: "Delivery Deal", stage: "won" }).returning();

      mockAuth.mockResolvedValue({ userId: `staff_${uId}` });
      mockCurrentUser.mockResolvedValue({ id: `staff_${uId}`, emailAddresses: [{ emailAddress: `staff_${uId}@aarotech.in` }] });

      // Setup Event Bus Spy
      const emitSpy = vi.spyOn(eventBus, "emit");

      const result = await createProjectAction({ dealId: deal.id, projectName: "Custom Execution Plan" });
      
      expect(result?.serverError).toBeUndefined();
      expect(result?.data).toBeDefined();
      expect(result?.data?.name).toBe("Custom Execution Plan");
      expect(result?.data?.organizationId).toBe(org.id);

      // Verify task creation
      const defaultTasks = await db.select().from(tasks).where(eq(tasks.projectId, result.data!.id));
      expect(defaultTasks.length).toBe(1);
      expect(defaultTasks[0].title).toBe("Project Kickoff");

      // Verify Event Bus
      expect(emitSpy).toHaveBeenCalledWith({
        type: "ProjectCreated",
        payload: {
          projectId: result.data!.id,
          projectName: "Custom Execution Plan",
          organizationId: org.id,
        }
      });

      // Cleanup
      await db.delete(tasks).where(eq(tasks.projectId, result.data!.id));
      await db.delete(projects).where(eq(projects.id, result.data!.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
      await db.delete(users).where(eq(users.id, internalUser.id));
    });
  });

  describe("Client Deliverable Reviews", () => {
    it("Client can approve a deliverable successfully", async () => {
      const uId = rand();
      const orgId = `org_${uId}`;
      
      const [clientUser] = await db.insert(users).values({
        clerkId: `client_${uId}`, email: `client_${uId}@example.com`, userType: "client"
      }).returning();

      const [org] = await db.insert(organizations).values({ name: "Review Org", clerkOrgId: orgId, slug: orgId }).returning();
      const [project] = await db.insert(projects).values({ organizationId: org.id, name: "Review Project" }).returning();
      
      const [deliverable] = await db.insert(deliverables).values({
        projectId: project.id,
        name: "Mockup V1",
        status: "client_review"
      }).returning();

      // Auth as client from the correct org
      mockAuth.mockResolvedValue({ userId: `client_${uId}`, orgId });
      mockCurrentUser.mockResolvedValue({ id: `client_${uId}`, emailAddresses: [{ emailAddress: `client_${uId}@example.com` }] });

      const result = await approveDeliverableAction({ deliverableId: deliverable.id, commentText: "Looks great!" });
      
      expect(result?.serverError).toBeUndefined();
      expect(result?.data?.status).toBe("approved");

      // Verify comment exists
      const dbComments = await db.select().from(comments).where(eq(comments.deliverableId, deliverable.id));
      expect(dbComments.length).toBe(1);
      expect(dbComments[0].text).toBe("Looks great!");

      // Cleanup
      await db.delete(comments).where(eq(comments.deliverableId, deliverable.id));
      await db.delete(deliverables).where(eq(deliverables.id, deliverable.id));
      await db.delete(projects).where(eq(projects.id, project.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
      await db.delete(users).where(eq(users.id, clientUser.id));
    });

    it("Client from Org B cannot access Org A's deliverable", async () => {
      const uId = rand();
      const orgAId = `orgA_${uId}`; // Target Org
      const orgBId = `orgB_${uId}`; // Hacker Org
      
      const [clientB] = await db.insert(users).values({
        clerkId: `hacker_${uId}`, email: `hacker_${uId}@example.com`, userType: "client"
      }).returning();

      const [orgA] = await db.insert(organizations).values({ name: "Target Org", clerkOrgId: orgAId, slug: orgAId }).returning();
      const [orgB] = await db.insert(organizations).values({ name: "Hacker Org", clerkOrgId: orgBId, slug: orgBId }).returning();
      const [projectA] = await db.insert(projects).values({ organizationId: orgA.id, name: "Target Project" }).returning();
      
      const [deliverableA] = await db.insert(deliverables).values({
        projectId: projectA.id,
        name: "Secret Data",
        status: "in_review"
      }).returning();

      // Auth as client from Org B
      mockAuth.mockResolvedValue({ userId: `hacker_${uId}`, orgId: orgBId });
      mockCurrentUser.mockResolvedValue({ id: `hacker_${uId}`, emailAddresses: [{ emailAddress: `hacker_${uId}@example.com` }] });

      const result = await requestRevisionAction({ deliverableId: deliverableA.id, commentText: "Change this!" });
      
      expect(result?.serverError).toContain("Unauthorized");

      // Cleanup
      await db.delete(deliverables).where(eq(deliverables.id, deliverableA.id));
      await db.delete(projects).where(eq(projects.id, projectA.id));
      await db.delete(organizations).where(eq(organizations.id, orgA.id));
      await db.delete(organizations).where(eq(organizations.id, orgB.id));
      await db.delete(users).where(eq(users.id, clientB.id));
    });
  });
});
