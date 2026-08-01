import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || 'Aarotech <notifications@aarotech.in>'; // Update with verified domain

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!resend) {
    console.error("EMAIL FAILED: RESEND_API_KEY is not configured.");
    throw new Error("RESEND_API_KEY is not configured. Email delivery failed.");
  }

  try {
    console.log(`Attempting to send email to ${to} from ${fromEmail}...`);
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    
    if (response.error) {
      console.error('RESEND API REJECTED THE EMAIL:', response.error);
      return { success: false, error: response.error };
    }
    
    console.log('EMAIL SENT SUCCESSFULLY:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('CRITICAL ERROR sending email via Resend:', error);
    return { success: false, error };
  }
}

export async function sendInvoiceCreatedEmail(to: string, orgName: string, invoiceId: string, amountCents: number) {
  const amountStr = (amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
  return sendEmail({
    to,
    subject: `New Invoice from Aarotech - ₹${amountStr}`,
    html: `
      <h2>New Invoice from Aarotech</h2>
      <p>Hello ${orgName},</p>
      <p>A new invoice (ID: ${invoiceId.substring(0, 8).toUpperCase()}) for <strong>₹${amountStr}</strong> has been generated for your account.</p>
      <p>Please log in to your Client Portal to review and pay this invoice.</p>
      <br/>
      <p>Thank you,<br/>Aarotech Team</p>
    `
  });
}

export async function sendDeliverableReviewEmail(to: string, orgName: string, deliverableName: string) {
  return sendEmail({
    to,
    subject: `Action Required: Review Deliverable "${deliverableName}"`,
    html: `
      <h2>Deliverable Ready for Review</h2>
      <p>Hello ${orgName},</p>
      <p>A new version of <strong>${deliverableName}</strong> is ready for your review.</p>
      <p>Please log in to your Client Portal to view the deliverable and provide your feedback or approval.</p>
      <br/>
      <p>Thank you,<br/>Aarotech Team</p>
    `
  });
}

export async function sendDeliverableClientResponseEmail(to: string, deliverableName: string, status: string) {
  return sendEmail({
    to, // Admin email
    subject: `Client ${status === 'approved' ? 'Approved' : 'Requested Changes'} on "${deliverableName}"`,
    html: `
      <h2>Client Response Received</h2>
      <p>The client has reviewed <strong>${deliverableName}</strong>.</p>
      <p>Status: <strong>${status}</strong></p>
      <p>Log in to the CRM to view the details.</p>
    `
  });
}

export async function sendPaymentReceiptEmail(to: string, orgName: string, paymentId: string, amountCents: number) {
  const amountStr = (amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
  return sendEmail({
    to,
    subject: `Payment Receipt from Aarotech - ₹${amountStr}`,
    html: `
      <h2>Payment Receipt</h2>
      <p>Hello ${orgName},</p>
      <p>We have successfully verified and applied your payment of <strong>₹${amountStr}</strong>.</p>
      <p>Payment ID: ${paymentId.substring(0, 8).toUpperCase()}</p>
      <p>Thank you for your business!</p>
      <br/>
      <p>Aarotech Team</p>
    `
  });
}
