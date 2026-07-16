"use server";

import { Resend } from "resend";
import { db } from "@/db";
import { websiteLeads } from "@/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const businessName = formData.get("businessName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
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
          challenge: actualChallenge,
        });
      }
    } catch (dbError) {
      console.error("Database error (but continuing to email):", dbError);
    }

    const htmlContent = `
      <h2>New Lead from Aarotech Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Business Name:</strong> ${businessName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Challenge/Interest:</strong> ${actualChallenge}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: "Aarotech Website <notifications@aarotech.in>",
      to: process.env.CONTACT_EMAIL || "info@aarotech.in",
      subject: `New Lead: ${businessName} - ${name}`,
      html: htmlContent,
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: "Failed to send email via Resend." };
    }

    return { success: true };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
