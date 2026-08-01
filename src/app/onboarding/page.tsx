import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth";
import { portalService } from "@/modules/portal/services";
import { CoreService } from "@/modules/core/services";
import { Button } from "@/components/ui/button";
import { OnboardingFlow } from "./_components/OnboardingFlow";
import { db } from "@/db";
import { clientOnboardings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function OnboardingPage(props: { searchParams: Promise<{ invite?: string }> }) {
  const user = await requireAuthenticatedUser();
  const searchParams = await props.searchParams;

  if (user.userType === 'internal') {
    redirect("/dashboard");
  }

  const membershipData = await portalService.getClientMembership(user.id);
  const isInvite = !!searchParams.invite;

  if (membershipData && membershipData.membership && membershipData.myOrg) {
    // Check if onboarding is completed
    const existing = await db.query.clientOnboardings.findFirst({
      where: eq(clientOnboardings.organizationId, membershipData.myOrg.id)
    });

    if (existing?.status === "completed") {
      redirect("/portal/home");
    }

    // They have an organization but haven't completed onboarding flow
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50/50 p-6 relative overflow-hidden">
        {/* Aesthetic background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px]" />
        
        <div className="relative z-10 w-full">
          <OnboardingFlow organizationId={membershipData.myOrg.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white" />
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center relative z-10">
        <h1 className="text-2xl font-bold mb-3 tracking-tight text-gray-900">Welcome to Aarotech</h1>
        {isInvite ? (
          <p className="text-gray-600 mb-8">You have been invited to join a client portal. Please accept the invitation to continue.</p>
        ) : (
          <p className="text-gray-600 mb-8">We could not find an active organization linked to your account. If you believe this is an error, please contact your project manager.</p>
        )}
        
        {isInvite && (
          <form action={async () => {
            "use server";
            // Mock: Auto-create an org and add them just to bypass for Epic 6
            await CoreService.acceptMockInvite(user.id);
            redirect("/onboarding"); // Redirect back here to start the step-by-step flow
          }}>
            <Button type="submit" className="w-full h-12 text-md rounded-full shadow-md hover:shadow-lg transition-all">Accept Invitation & Continue</Button>
          </form>
        )}
      </div>
    </div>
  );
}
