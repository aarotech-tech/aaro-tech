import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { handleDealWon } from "../../../inngest/functions/orchestration";
import { handleStandardNotifications } from "../../../inngest/functions/notifications";

// Export the API route for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleDealWon,
    handleStandardNotifications
  ],
});
