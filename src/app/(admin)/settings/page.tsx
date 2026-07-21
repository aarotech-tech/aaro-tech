import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { requireInternalUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { updateOrganizationSettings } from "@/app/actions/settings";

export default async function GeneralSettingsPage() {
  await requireInternalUser();
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.type, "internal"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your organization's business details.</p>
      </div>

      <form action={async (formData) => { "use server"; await updateOrganizationSettings(formData); }}>
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>This information will be displayed on client-facing documents like invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input name="name" defaultValue={org?.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax ID / GSTIN</label>
                <Input name="taxId" defaultValue={org?.taxId || ""} placeholder="Enter Tax ID" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input name="address" defaultValue={org?.address || ""} placeholder="123 Business Avenue" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input name="city" defaultValue={org?.city || ""} placeholder="San Francisco" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input name="country" defaultValue={org?.country || ""} placeholder="United States" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
