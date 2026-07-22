import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage(props: { searchParams: { invite?: string } }) {
  const user = await requireAuthenticatedUser();
  const searchParams = await props.searchParams;

  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id)
  });

  if (membership) {
    redirect("/portal/home");
  }

  // If there's an invite token, they'd accept it here (simplified for mockup)
  const isInvite = !!searchParams.invite;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to Aarotech</h1>
        {isInvite ? (
          <p className="text-gray-600 mb-6">You have been invited to join a client portal. Please accept the invitation to continue.</p>
        ) : (
          <p className="text-gray-600 mb-6">We could not find an active organization linked to your account. If you believe this is an error, please contact your project manager.</p>
        )}
        
        {isInvite && (
          <form action={async () => {
            "use server";
            // Mock: Auto-create an org and add them just to bypass for Epic 6
            const [org] = await db.insert(organizations).values({ 
              name: "New Client Org",
              clerkOrgId: `mock_${Date.now()}`,
              slug: `new-client-org-${Date.now()}`
            }).returning();
            await db.insert(organizationMembers).values({ organizationId: org.id, userId: user.id, role: "admin" });
            redirect("/portal/home");
          }}>
            <Button type="submit" className="w-full">Accept Invitation & Continue</Button>
          </form>
        )}
      </div>
    </div>
  );
}
