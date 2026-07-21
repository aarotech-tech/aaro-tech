import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db";
import { organizations, contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tenantActionClient } from "@/lib/safe-action";
import { addContactAction, getContactsAction } from "@/modules/directory/actions";
import crypto from "crypto";

const rand = () => crypto.randomBytes(4).toString("hex");

// Mock Clerk
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Tenant Isolation - Safe Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tenantActionClient fails when orgId is missing", async () => {
    // Provide userId but NO orgId
    mockAuth.mockResolvedValue({ userId: "user_123", orgId: null });

    const result = await getContactsAction();
    // next-safe-action catches thrown errors and returns them as serverError
    expect(result?.serverError).toBe("Organization Required");
  });

  it("Organization A cannot view or mutate Organization B data", async () => {
    const orgAId = `clerk_org_${rand()}`;
    const orgBId = `clerk_org_${rand()}`;

    const [orgA] = await db.insert(organizations).values({ name: "Org A", clerkOrgId: orgAId, slug: orgAId }).returning();
    const [orgB] = await db.insert(organizations).values({ name: "Org B", clerkOrgId: orgBId, slug: orgBId }).returning();

    // Set context to Org A
    mockAuth.mockResolvedValue({ userId: "user_123", orgId: orgAId });

    // Mutate: Create a contact
    const contactPayload = { name: "John Doe", email: "john@example.com" };
    const createResult = await addContactAction(contactPayload);
    
    expect(createResult?.data).toBeDefined();
    expect(createResult?.data?.organizationId).toBe(orgA.id); // Bound to Org A
    expect(createResult?.data?.organizationId).not.toBe(orgB.id);

    // Read: Fetch contacts as Org A
    const fetchA = await getContactsAction();
    expect(fetchA?.data).toBeDefined();
    expect(fetchA!.data!.length).toBe(1);
    expect(fetchA!.data![0].name).toBe("John Doe");

    // Switch context to Org B
    mockAuth.mockResolvedValue({ userId: "user_123", orgId: orgBId });

    // Read: Fetch contacts as Org B
    const fetchB = await getContactsAction();
    expect(fetchB?.data).toBeDefined();
    expect(fetchB!.data!.length).toBe(0); // Should see nothing

    // Cleanup
    await db.delete(contacts).where(eq(contacts.id, createResult.data!.id));
    await db.delete(organizations).where(eq(organizations.id, orgA.id));
    await db.delete(organizations).where(eq(organizations.id, orgB.id));
  });
});
