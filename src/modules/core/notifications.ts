import { Resend } from "resend";
import React from "react";

// The abstraction interface
export interface INotificationProvider {
  sendEmail(options: { to: string; subject: string; react: React.ReactElement }): Promise<void>;
  sendInAppNotification(options: { userId: string; message: string; link?: string }): Promise<void>;
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

  async sendInAppNotification(options: { userId: string; message: string; link?: string }) {
    // In-app notifications will be implemented in a future milestone (e.g., using Novu or a custom DB table)
    console.log(`[IN-APP] To ${options.userId}: ${options.message}`);
  }
}

// Export the singleton
export const notificationService: INotificationProvider = new ResendProvider();
