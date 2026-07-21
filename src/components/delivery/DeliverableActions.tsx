"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { approveDeliverableAction, requestRevisionAction } from "@/modules/delivery/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function DeliverableActions({ deliverableId, currentStatus }: { deliverableId: string, currentStatus: string }) {
  const [comment, setComment] = useState("");
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);

  const approveAction = useAction(approveDeliverableAction, {
    onSuccess: (res) => {
      if (res.data) {
        toast.success("Deliverable approved successfully!");
        setIsApproveOpen(false);
      }
    },
    onError: (error) => {
      toast.error(`Approval failed: ${error.error.serverError}`);
    }
  });

  const revisionAction = useAction(requestRevisionAction, {
    onSuccess: (res) => {
      if (res.data) {
        toast.success("Revision requested.");
        setIsRevisionOpen(false);
      }
    },
    onError: (error) => {
      toast.error(`Revision request failed: ${error.error.serverError}`);
    }
  });

  if (currentStatus === "approved") {
    return (
      <div className="flex items-center text-green-600 gap-2 font-medium">
        <CheckCircle size={18} />
        Approved
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Request Revision Dialog */}
      <Dialog open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
        <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
          <AlertCircle size={16} />
          Request Revision
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Revision</DialogTitle>
            <DialogDescription>
              Please let our team know what changes you would like us to make.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Detailed feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevisionOpen(false)} disabled={revisionAction.isExecuting}>Cancel</Button>
            <Button 
              onClick={() => revisionAction.execute({ deliverableId, commentText: comment })}
              disabled={revisionAction.isExecuting || comment.trim().length === 0}
            >
              {revisionAction.isExecuting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogTrigger render={<Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" />}>
          <CheckCircle size={16} />
          Approve
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Deliverable</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this deliverable? You can optionally leave a closing comment.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Looks great! Thanks..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={approveAction.isExecuting}>Cancel</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => approveAction.execute({ deliverableId, commentText: comment })}
              disabled={approveAction.isExecuting}
            >
              {approveAction.isExecuting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
