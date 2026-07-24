import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TeamTable } from "./TeamTable";
import { PageHeader } from "@/components/ui/page-header";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireInternalUser } from "@/lib/auth";

export default async function TeamSettingsPage() {
  await requireInternalUser();
  const team = await db.select().from(users);
  
  // Format to match TeamTable props, if needed. TeamTable expects {id, name, email, role}
  const formattedTeam = team.map(u => ({
    id: u.id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
    email: u.email,
    role: u.globalRole || u.role || 'Member',
  }));

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
          <TeamTable team={formattedTeam} />
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
