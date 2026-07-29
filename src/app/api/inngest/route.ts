import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { handleDealWon, handleProposalAccepted, handleInvoicePaid } from "../../../inngest/functions/orchestration";
import { handleStandardNotifications } from "../../../inngest/functions/notifications";
import { processOutbox } from "../../../inngest/functions/outbox";

// Export the API route for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleDealWon,
    handleProposalAccepted,
    handleInvoicePaid,
    handleStandardNotifications,
    processOutbox
  ],
});
