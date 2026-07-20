"use client";

import { useState } from "react";
import { submitClientReviewAction } from "../../actions";
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react";

export default function ReviewActions({ deliverableId, versionId }: { deliverableId: string, versionId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  const handleReview = async (action: "approve" | "request_changes") => {
    setIsSubmitting(true);
    await submitClientReviewAction(deliverableId, versionId, action, comment);
    // Hard refresh or revalidate handles state sync
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Submit Your Review</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Feedback (Optional for approval, required for changes)</label>
        <textarea 
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Let us know what you think..."
          className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={() => handleReview("approve")}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? <Loader2Icon className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircleIcon className="w-5 h-5 mr-2" />}
          Approve Design
        </button>
        <button 
          onClick={() => handleReview("request_changes")}
          disabled={isSubmitting || !comment.trim()}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 border border-gray-700"
        >
          {isSubmitting ? <Loader2Icon className="w-5 h-5 mr-2 animate-spin" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
          Request Changes
        </button>
      </div>
    </div>
  );
}
