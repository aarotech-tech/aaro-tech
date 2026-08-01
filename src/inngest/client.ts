import { Inngest } from "inngest";
import { sentryMiddleware } from "@inngest/middleware-sentry";

// Initialize the Inngest client for Aarotech
export const inngest = new Inngest({
  id: "aarotech",
  name: "Aarotech Automation Center",
  eventKey: process.env.INNGEST_EVENT_KEY || "local",
  middleware: [sentryMiddleware()],
});
