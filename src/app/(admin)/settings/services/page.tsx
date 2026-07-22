import { PageHeader } from "@/components/ui/page-header";

export default function ServicesSettingsPage() {
  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Services Catalog"
          description="Manage the list of services and base prices for your agency."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: "Services" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p>The service catalog management interface is currently under construction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
