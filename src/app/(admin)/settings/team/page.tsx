import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TeamTable } from "./TeamTable";
import { PageHeader } from "@/components/ui/page-header";

export default function TeamSettingsPage() {
  const dummyTeam = [
    { id: 1, name: "Admin User", email: "admin@aarotech.in", role: "Owner" },
    { id: 2, name: "Jane Doe", email: "jane@aarotech.in", role: "Manager" },
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Team Members"
          description="Manage who has access to your organization."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: "Team" }
          ]}
          primaryAction={<Button>Invite Member</Button>}
        />
      </div>

      <div className="p-6 pt-0 flex-1">
        <div className="max-w-4xl">

      <Card>
        <CardHeader>
          <CardTitle>Active Members</CardTitle>
          <CardDescription>People currently in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamTable team={dummyTeam} />
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
