import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" defaultValue={user.firstName || ""} className="w-full p-2 border rounded-md" disabled />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" defaultValue={user.lastName || ""} className="w-full p-2 border rounded-md" disabled />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" defaultValue={user.email} className="w-full p-2 border rounded-md" disabled />
              </div>
              <Button>Save Changes</Button>
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
              <p className="text-xs text-gray-500">Contact your project manager to update billing details or organization structure.</p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
