"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addDealNoteAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface DealNotesProps {
  dealId: string;
  notes: any[];
}

export function DealNotes({ dealId, notes }: DealNotesProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addDealNoteAction({ dealId, content: content.trim() });
      if (res?.data) {
        setContent("");
        toast.success("Note added");
      } else {
        toast.error(res?.serverError || "Failed to add note");
      }
    } catch (err) {
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Add a note about this deal..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !content.trim()} size="sm">
            {isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </form>

      <div className="space-y-4 mt-6">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{note.authorName || "Unknown"}</span>
                <span className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
