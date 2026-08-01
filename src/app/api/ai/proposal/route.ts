import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { dealName, clientName, industry, lineItems } = await req.json();

    // Mocking an AI API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const content = `
<h2>Proposal for ${dealName}</h2>
<p>Dear ${clientName},</p>
<p>Based on our understanding of the ${industry || "technology"} industry and your specific requirements, we propose the following solution to help you achieve your business objectives.</p>

<h3>Executive Summary</h3>
<p>We will deliver a comprehensive solution tailored to your operational needs. Our approach focuses on scalability, efficiency, and rapid deployment.</p>

<h3>Proposed Scope of Work</h3>
<ul>
  ${(lineItems as any[])?.map(item => `<li><strong>${item.name}</strong>: ${item.description || "Implementation and support"}</li>`).join("\n") || "<li>Full-service implementation</li>"}
</ul>

<h3>Next Steps</h3>
<p>If you find this proposal aligns with your goals, please proceed by accepting it via the client portal. We will then draft the final SOW and initiate onboarding.</p>

<p>Sincerely,</p>
<p>The Aarotech Team</p>
    `;

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
