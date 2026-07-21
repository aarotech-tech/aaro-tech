import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { UserCircleIcon, FileTextIcon, BriefcaseIcon, DollarSignIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityTimelineProps {
  entityType: string;
  entityId: string;
  organizationId: string;
}

export async function ActivityTimeline({ entityType, entityId, organizationId }: ActivityTimelineProps) {
  const logs = await db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    metadata: auditLogs.metadata,
    createdAt: auditLogs.createdAt,
    user: {
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      imageUrl: users.avatarUrl,
    }
  })
  .from(auditLogs)
  .leftJoin(users, eq(auditLogs.userId, users.id))
  .where(
    and(
      eq(auditLogs.entityType, entityType),
      eq(auditLogs.entityId, entityId)
    )
  )
  .orderBy(desc(auditLogs.createdAt));

  if (logs.length === 0) {
    return <div className="text-sm text-muted-foreground italic py-4">No activity recorded yet.</div>;
  }

  return (
    <div className="space-y-6 pt-4">
      {logs.map((log) => {
        const userName = log.user?.firstName ? `${log.user.firstName} ${log.user.lastName || ''}` : 'System / Guest';
        const initials = log.user?.firstName ? log.user.firstName[0] : 'S';
        
        let displayAction = log.action;
        // Humanize common actions
        if (log.action === "DealCreated") displayAction = "Deal was created";
        else if (log.action === "ProposalSent") displayAction = "Proposal was sent to client";
        else if (log.action === "ProposalAccepted") displayAction = "Proposal was accepted";
        else if (log.action === "InvoiceCreated") displayAction = "Invoice was generated";
        else if (log.action === "PaymentRecorded") displayAction = "Payment was recorded";
        else if (log.action === "ProjectCreated") displayAction = "Project was kicked off";
        else if (log.action === "DeliverableApproved") displayAction = "Deliverable was approved";
        else if (log.action === "RevisionRequested") displayAction = "Revision was requested";

        return (
          <div key={log.id} className="flex gap-4 group">
            <div className="relative flex flex-col items-center">
              <div className="absolute top-8 bottom-[-24px] w-px bg-border group-last:hidden" />
              <Avatar className="h-8 w-8 border bg-background">
                <AvatarImage src={log.user?.imageUrl || undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-medium text-foreground">{userName}</span>{" "}
                  <span className="text-muted-foreground">{displayAction.toLowerCase()}</span>
                </p>
                <time className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
                  }) : ''}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
