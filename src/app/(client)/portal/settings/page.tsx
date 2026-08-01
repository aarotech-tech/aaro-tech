import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrganizationProfile, UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { portalService } from "@/modules/portal/services";

export default async function ClientSettingsPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const { myOrg: org } = membershipData;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-4xl mx-auto w-full">
        <PageHeader 
          title="Settings"
          description="Manage your profile, organization, and preferences."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Settings" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-4xl mx-auto w-full">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start bg-gray-100 font-medium text-gray-900">
            <User className="w-4 h-4 mr-2" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
            <Building2 className="w-4 h-4 mr-2" /> Organization
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
            <Shield className="w-4 h-4 mr-2" /> Security
          </Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-sm border-0 bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="text-lg text-gray-900">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <UserProfile 
                appearance={{
                  elements: {
                    rootBox: "w-full shadow-sm rounded-xl border border-gray-200",
                    card: "shadow-none border-0 w-full max-w-full",
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" defaultValue={org?.name || ""} className="w-full p-2 border rounded-md" disabled />
              </div>
              <p className="text-xs text-gray-500 mb-4">Contact your project manager to update billing details or organization structure.</p>

              <div className="mt-8 flex justify-center">
                <OrganizationProfile />
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
