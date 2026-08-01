import { db } from "@/db";
import { organizations, organizationMembers, users, files, automationLogs, contacts, deals, projects, invoices, retainerPeriods, retainers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from 'drizzle-orm';

export const CoreRepo = {
  updateOrg: async (id: string, data: any) => 
    await db.update(organizations).set(data).where(eq(organizations.id, id))
};

export const CoreService = {
  updateOrgSettings: async (id: string, data: any) => CoreRepo.updateOrg(id, data),

  acceptMockInvite: async (userId: string) => {
    return await db.transaction(async (tx) => {
      const [org] = await tx.insert(organizations).values({ 
        name: "New Client Org",
        clerkOrgId: `mock_${Date.now()}`,
        slug: `new-client-org-${Date.now()}`
      }).returning();
      await tx.insert(organizationMembers).values({ organizationId: org.id, userId: userId, role: "admin" });
      return org;
    });
  },

  syncUser: async (data: { clerkId: string, email: string, firstName: string, lastName: string, avatarUrl: string }) => {
    const isInternal = data.email.endsWith('@aarotech.in');
    const dbData = {
      ...data,
      userType: isInternal ? 'internal' : 'client',
      role: isInternal ? 'superadmin' : 'client',
      globalRole: isInternal ? 'owner' : null,
    };
    const [user] = await db.insert(users).values(dbData).onConflictDoUpdate({
      target: users.clerkId,
      set: dbData
    }).returning();

    if (!isInternal && user) {
      await db.update(contacts)
        .set({ userId: user.id })
        .where(eq(contacts.email, data.email));
    }
  },

  deleteUser: async (clerkId: string) => {
    await db.delete(users).where(eq(users.clerkId, clerkId));
  },

  updateUserRole: async (userId: string, globalRole: string) => {
    const [user] = await db.update(users).set({ globalRole }).where(eq(users.id, userId)).returning();
    return user;
  },

  suspendUser: async (userId: string) => {
    const [user] = await db.update(users).set({ status: 'suspended' }).where(eq(users.id, userId)).returning();
    return user;
  },

  activateUser: async (userId: string) => {
    const [user] = await db.update(users).set({ status: 'active' }).where(eq(users.id, userId)).returning();
    return user;
  },

  getDerivedOrganizationId: async (projectId?: string, retainerPeriodId?: string) => {
    if (projectId) {
      const p = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
      if (p) return p.organizationId;
    } else if (retainerPeriodId) {
      const rp = await db.query.retainerPeriods.findFirst({ where: eq(retainerPeriods.id, retainerPeriodId) });
      if (rp) {
        const r = await db.query.retainers.findFirst({ where: eq(retainers.id, rp.retainerId) });
        if (r) return r.organizationId;
      }
    }
    return null;
  },

  saveUploadedFile: async (metadata: any, file: any) => {
    await db.insert(files).values({
      organizationId: metadata.organizationId,
      projectId: metadata.projectId || null,
      retainerPeriodId: metadata.retainerPeriodId || null,
      name: file.name,
      url: file.url,
      key: file.key,
      size: file.size,
      mimeType: file.type,
      uploadedById: metadata.userId
    });
  },

  getOrganizationFiles: async (organizationId: string) => {
    return await db.query.files.findMany({
      where: eq(files.organizationId, organizationId),
      orderBy: [desc(files.createdAt)],
      with: { uploadedBy: true }
    });
  },

  checkDatabaseHealth: async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (e) {
      return false;
    }
  },

  getOrganizationDetails: async (orgId: string) => {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId)
    });

    if (!org) return null;

    const orgContacts = await db.query.contacts.findMany({
      where: eq(contacts.organizationId, orgId)
    });

    const orgDeals = await db.query.deals.findMany({
      where: eq(deals.organizationId, orgId)
    });

    const orgProjects = await db.query.projects.findMany({
      where: eq(projects.organizationId, orgId)
    });

    const orgInvoices = await db.query.invoices.findMany({
      where: eq(invoices.organizationId, orgId)
    });

    return { org, orgContacts, orgDeals, orgProjects, orgInvoices };
  },

  getInternalOrganization: async () => {
    return await db.query.organizations.findFirst({
      where: eq(organizations.type, 'internal'),
    });
  },

  getAutomationLogs: async () => {
    return await db.query.automationLogs.findMany({
      orderBy: [desc(automationLogs.createdAt)],
      limit: 50,
    });
  }
};
