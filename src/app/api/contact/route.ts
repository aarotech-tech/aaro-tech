import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    // In the future, this can easily be swapped to HubSpot, Salesforce, or Resend
    // by using the respective SDKs here instead of the Formspree fetch.
    const formspreeEndpoint = "https://formspree.io/f/mzdqqdao";
    
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json({ error: "Failed to submit", details: errorData }, { status: 400 });
    }
  } catch (error) {
    console.error("Contact Form API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
