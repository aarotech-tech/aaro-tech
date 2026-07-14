"use server";

import { db } from "@/db";
import { proposals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function generateProposalWithAI(proposalId: string, dealName: string, orgName: string) {
  // In a real application, this would call OpenAI or Anthropic via the Vercel AI SDK
  // e.g. await generateText({ model: openai('gpt-4o'), prompt: ... })
  
  // For this mock, we will simulate a 1.5s delay to represent API latency
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const mockAIResponse = `
    <h1>Proposal for ${orgName}</h1>
    <p>Dear ${orgName} Team,</p>
    <p>Thank you for considering Aarotech for your upcoming project: <strong>${dealName}</strong>. 
    Based on our initial conversations, we have prepared the following strategic roadmap to help you achieve your goals.</p>
    
    <h2>1. Executive Summary</h2>
    <p>Our objective is to deliver a robust, scalable solution tailored specifically to the needs of the ${orgName} ecosystem. We understand that time-to-market and premium quality are your top priorities.</p>
    
    <h2>2. Scope of Work</h2>
    <ul>
      <li>Comprehensive Audit and Strategy Documentation</li>
      <li>Custom Design & Development Iterations</li>
      <li>Quality Assurance & Launch</li>
      <li>30 Days of Post-Launch Support</li>
    </ul>
    
    <h2>3. Timeline</h2>
    <p>We anticipate this engagement will take approximately 4-6 weeks from the date of the kickoff meeting, assuming timely feedback on all deliverables.</p>
    
    <p>We look forward to partnering with you on this exciting initiative!</p>
    <p>Best regards,<br/>The Aarotech Team</p>
  `;
  
  await db.update(proposals)
    .set({ documentData: mockAIResponse })
    .where(eq(proposals.id, proposalId));
    
  revalidatePath(`/crm/proposals/${proposalId}`);
}
