import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'Aarotech <notifications@aarotech.in>',
      to: 'info@aarotech.in',
      subject: 'Test Email',
      html: '<p>Test</p>'
    });
    console.log("RESULT:", data);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

testEmail();
