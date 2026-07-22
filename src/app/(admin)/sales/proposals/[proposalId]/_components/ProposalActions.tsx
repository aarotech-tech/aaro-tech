"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendProposalToClientAction } from "../actions";
import { CheckCircle2Icon, LoaderIcon, SendIcon, SaveIcon } from "lucide-react";

interface ProposalActionsProps {
  proposalId: string;
  proposalStatus: string;
  documentData: string | null;
  portalBaseUrl?: string;
}

export default function ProposalActions({
  proposalId,
  proposalStatus,
  documentData,
}: ProposalActionsProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(proposalStatus === "sent" || proposalStatus === "accepted");
  const [portalLink, setPortalLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSendToClient() {
    setSending(true);
    setError(null);
    try {
      const result = await sendProposalToClientAction(proposalId);
      if (result && !("error" in result)) {
        setSent(true);
        if (result && typeof result === "object" && "portalLink" in result) {
          setPortalLink((result as { portalLink: string }).portalLink);
        }
      } else if (result && "error" in result) {
        setError((result as { error: string }).error || "Failed to send proposal.");
      }
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
          {proposalStatus}
        </span>

        {sent ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            <CheckCircle2Icon className="w-4 h-4" />
            Proposal Sent to Client
          </div>
        ) : (
          <Button
            onClick={handleSendToClient}
            disabled={sending || !documentData}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
            title={!documentData ? "Generate content before sending" : "Send to client via email"}
          >
            {sending ? (
              <>
                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4 mr-2" />
                Send to Client
              </>
            )}
          </Button>
        )}
      </div>

      {/* Portal Link (shown after sending) */}
      {portalLink && (
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 max-w-sm w-full">
          <span className="font-medium text-gray-700">Client portal link:</span>{" "}
          <a
            href={portalLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {portalLink}
          </a>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 max-w-sm w-full">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
