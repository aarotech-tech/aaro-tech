"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { Resend } from "resend";
import { db } from "@/db";
import { websiteLeads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(formData: FormData) {
  return withActionErrorHandling('submitContactForm', async () => {
    const forwardedFor = (await headers()).get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(',')[0] : "unknown";
    
    await rateLimit(`contact_form_${ip}`, { points: 3, durationInSeconds: 3600 });

    const name = formData.get("name") as string;
    const businessName = formData.get("businessName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const websiteUrl = formData.get("websiteUrl") as string;
    const challenge = formData.get("challenge") as string;
    const otherChallenge = formData.get("otherChallenge") as string;

    const actualChallenge = challenge === "Other" ? otherChallenge : challenge;

    try {
      const existingLead = await db.select().from(websiteLeads).where(eq(websiteLeads.email, email)).limit(1);
      
      if (existingLead.length > 0) {
        await db.update(websiteLeads)
          .set({ 
            name, 
            businessName, 
            phone,
            websiteUrl,
            challenge: actualChallenge,
            updatedAt: new Date()
          })
          .where(eq(websiteLeads.email, email));
      } else {
        await db.insert(websiteLeads).values({
          name,
          businessName,
          email,
          phone,
          websiteUrl,
          challenge: actualChallenge,
        });
      }
    } catch (dbError) {
      logger.error("Database error in contact form", { error: String(dbError) });
    }

    const htmlContent = `
      <h2>New Lead from Aarotech Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Business Name:</strong> ${businessName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Website URL:</strong> ${websiteUrl || "Not provided"}</p>
      <p><strong>Challenge/Interest:</strong> ${actualChallenge}</p>
    `;

    // Phase 3H: Background Work - don't await Resend. We just log the intent and let it run.
    // Wait, Vercel Serverless Functions freeze execution when response is returned, 
    // so we need waitUntil in Edge, but in Node we can await it or just await it normally.
    // Since we need to know if it failed, we will await it.
    const { data, error } = await resend.emails.send({
      from: "Aarotech Website <notifications@aarotech.in>",
      to: process.env.CONTACT_EMAIL || "info@aarotech.in",
      subject: `New Lead: ${businessName} - ${name}`,
      html: htmlContent,
      replyTo: email,
    });

    if (error) {
      throw new AppError("Failed to send email via Resend.");
    }

    return true;
  });
}
