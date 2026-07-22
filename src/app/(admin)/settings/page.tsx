import { requireInternalUser } from "@/lib/auth";
import { SettingsForm } from "./_components/SettingsForm";
import { PageHeader } from "@/components/ui/page-header";
import { CoreService } from "@/modules/core/services";

export default async function GeneralSettingsPage() {
  await requireInternalUser();
  const org = await CoreService.getInternalOrganization();

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="General Settings"
          description="Manage your organization's business details."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings" },
            { label: "General" }
          ]}
        />
      </div>
      <div className="p-6 pt-0 flex-1">
        <div className="max-w-2xl">
          <SettingsForm org={org} />
        </div>
      </div>
    </div>
  );
}
