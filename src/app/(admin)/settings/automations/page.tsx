import { requireInternalUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clock, Webhook, Activity, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { CoreService } from "@/modules/core/services";
import { AutomationService } from "@/modules/automations/services";
import { NewAutomationModal } from "./_components/NewAutomationModal";
import { ManageWebhooksModal } from "./_components/ManageWebhooksModal";
import { DeleteAutomationButton } from "./_components/DeleteAutomationButton";
import { DeleteWebhookButton } from "./_components/DeleteWebhookButton";
import { EmptyState } from "@/components/ui/EmptyState";

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default async function AutomationsSettingsPage() {
  await requireInternalUser();
  
  const [logs, automations, webhooks] = await Promise.all([
    CoreService.getAutomationLogs(),
    AutomationService.getSystemAutomations(),
    AutomationService.getWebhooks(),
  ]);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Automation Settings"
          description="Configure workflow automations, webhooks, and system integrations."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: "Automations" }
          ]}
          primaryAction={<NewAutomationModal />}
        />
      </div>
      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full mt-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" /> System Automations
              </CardTitle>
              <CardDescription>
                Core automated workflows for sales and delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automations.length === 0 ? (
                  <EmptyState icon={Bot} title="No automations" description="No automations configured yet." />
                ) : (
                  automations.map(auto => (
                    <div key={auto.id} className="flex items-center justify-between group">
                      <div className="text-sm font-medium">{auto.name}</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${auto.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {auto.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteAutomationButton id={auto.id} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-500" /> Webhooks
              </CardTitle>
              <CardDescription>
                External endpoints receiving real-time events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <EmptyState icon={Webhook} title="No webhooks" description="No webhooks configured yet." />
                ) : (
                  webhooks.map(webhook => (
                    <div key={webhook.id} className="flex items-center justify-between group">
                      <div className="text-sm font-medium">{webhook.description || webhook.url}</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteWebhookButton id={webhook.id} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <ManageWebhooksModal />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Scheduled Jobs
              </CardTitle>
              <CardDescription>
                Cron tasks and background jobs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Daily Backups</div>
                  <div className="text-xs text-muted-foreground">00:00 UTC</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Email Digest</div>
                  <div className="text-xs text-muted-foreground">08:00 UTC</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Metric Aggregation</div>
                  <div className="text-xs text-muted-foreground">Hourly</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Recent Automation Activity
            </CardTitle>
            <CardDescription>
              A real-time log of background jobs and automation triggers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <EmptyState icon={Activity} title="No activity yet" description="No automation logs found in the database." />
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {log.status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {log.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                        {log.status === "running" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                        {log.status === "queued" && <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{log.jobName}</div>
                        <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                          <span className="capitalize">{log.status}</span>
                          <span>•</span>
                          <span>
                            {log.createdAt ? timeAgo(new Date(log.createdAt)) : "Unknown"}
                          </span>
                        </div>
                        {log.errorMessage && (
                          <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                            {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
