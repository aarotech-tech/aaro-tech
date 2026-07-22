import { Resend } from "resend";
import React from "react";

// The abstraction interface
export interface INotificationProvider {
  sendEmail(options: { to: string; subject: string; react: React.ReactElement }): Promise<void>;
  sendInAppNotification(options: { 
    recipient: string; // can be a user ID or a role string like 'delivery_team', 'finance_team'
    organizationId: string;
    message: string; 
    link?: string;
    entityType?: string;
    entityId?: string;
  }): Promise<void>;
  getDashboardFeed(userId: string): Promise<any>;
  getClientDashboardFeed(organizationId: string): Promise<any>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  archive(userId: string, notificationId: string): Promise<void>;
}

// Resend Implementation
class ResendProvider implements INotificationProvider {
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async sendEmail(options: { to: string; subject: string; react: React.ReactElement }) {
    if (!this.resend) {
      console.warn("RESEND_API_KEY not set. Mock sending email to:", options.to);
      return;
    }
    
    try {
      await this.resend.emails.send({
        from: "Aarotech <hello@aarotech.in>",
        to: options.to,
        subject: options.subject,
        react: options.react,
      });
      console.log(`Email sent successfully to ${options.to}`);
    } catch (e) {
      console.error("Failed to send email via Resend:", e);
    }
  }

  async sendInAppNotification(options: { 
    recipient: string; 
    organizationId: string;
    message: string; 
    link?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const { db } = await import("@/db");
    const { users, notifications } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    let recipientIds: string[] = [];

    // Simple role-based resolution
    if (options.recipient.endsWith("_team") || options.recipient === "internal") {
      // Find all internal users to notify. In a real app, you'd check roles.
      const internalUsers = await db.query.users.findMany({
        where: eq(users.userType, "internal")
      });
      recipientIds = internalUsers.map(u => u.id);
    } else {
      // Treat recipient as an exact user ID
      recipientIds = [options.recipient];
    }

    if (recipientIds.length === 0) return;

    // Insert a notification for each resolved recipient
    await db.insert(notifications).values(
      recipientIds.map(userId => ({
        userId,
        organizationId: options.organizationId,
        message: options.message,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.link ? JSON.stringify({ link: options.link }) : null,
        read: false
      }))
    );
  }

  async getDashboardFeed(userId: string) {
    const { db } = await import("@/db");
    const { notifications } = await import("@/db/schema");
    const { eq, and, desc, sql } = await import("drizzle-orm");

    const allNotifications = await db.query.notifications.findMany({
      where: and(eq(notifications.userId, userId), eq(notifications.archived, false)),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    const unreadCount = allNotifications.filter(n => !n.read).length;
    
    // Categorize them
    const pendingApprovals = allNotifications.filter(n => n.type === "Domain/DeliverableSubmitted" || n.type === "Domain/RevisionRequested");
    const systemAlerts = allNotifications.filter(n => n.type === "SystemAlert");
    const recentActivity = allNotifications.filter(n => n.type !== "SystemAlert" && !pendingApprovals.includes(n));

    return {
      unreadCount,
      recentActivity,
      pendingApprovals,
      systemAlerts
    };
  }

  async getClientDashboardFeed(organizationId: string) {
    const { db } = await import("@/db");
    const { notifications } = await import("@/db/schema");
    const { eq, and, desc } = await import("drizzle-orm");

    const clientNotifications = await db.query.notifications.findMany({
      where: and(eq(notifications.organizationId, organizationId), eq(notifications.archived, false)),
      orderBy: [desc(notifications.createdAt)],
      limit: 30,
    });

    const unreadCount = clientNotifications.filter(n => !n.read).length;

    return {
      unreadCount,
      notifications: clientNotifications
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const { db } = await import("@/db");
    const { notifications } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");
    await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  async markAllAsRead(userId: string) {
    const { db } = await import("@/db");
    const { notifications } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async archive(userId: string, notificationId: string) {
    const { db } = await import("@/db");
    const { notifications } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");
    await db.update(notifications).set({ archived: true }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }
}

// Export the singleton
export const notificationService: INotificationProvider = new ResendProvider();
