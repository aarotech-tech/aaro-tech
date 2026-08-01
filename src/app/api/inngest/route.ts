import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { handleDealWon, handleProposalAccepted, handleInvoicePaid } from "../../../inngest/functions/orchestration";
import { handleStandardNotifications, handleSecondaryNotifications } from "../../../inngest/functions/notifications";
import { processOutbox } from "../../../inngest/functions/outbox";
import { checkOverdueInvoices } from "../../../inngest/functions/finance";

// Export the API route for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleDealWon,
    handleProposalAccepted,
    handleInvoicePaid,
    handleStandardNotifications,
    handleSecondaryNotifications,
    processOutbox,
    checkOverdueInvoices
  ],
});
