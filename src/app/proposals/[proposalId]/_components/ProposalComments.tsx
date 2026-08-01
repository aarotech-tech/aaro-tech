"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addProposalCommentAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";

interface ProposalCommentsProps {
  proposalId: string;
  comments: any[];
  currentUser?: { id: string; name: string };
  clientName?: string;
}

export function ProposalComments({ proposalId, comments, currentUser, clientName }: ProposalCommentsProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const authorName = currentUser?.name || clientName || "Client";
      const res = await addProposalCommentAction({
        proposalId,
        text: text.trim(),
        authorName,
        userId: currentUser?.id,
      });

      if (res?.data) {
        setText("");
        toast.success("Comment posted");
      } else {
        toast.error(res?.serverError || "Failed to post comment");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden mt-8">
      <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Negotiation & Comments</h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-6 mb-6">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No comments yet. Leave a message below if you have any questions or requests for changes.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className={`flex flex-col ${c.userId ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{c.authorName}</span>
                  <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className={`p-3 rounded-xl max-w-[85%] text-sm ${c.userId ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                  {c.text}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t pt-4">
          <Textarea 
            placeholder="Type your comment or question here..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="mb-3 min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !text.trim()}>
              <Send className="h-4 w-4 mr-2" /> Post Comment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
