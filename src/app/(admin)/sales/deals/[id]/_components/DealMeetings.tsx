"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMeetingAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DealMeetingsProps {
  dealId: string;
  meetings: any[];
}

export function DealMeetings({ dealId, meetings }: DealMeetingsProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt) return;

    setIsSubmitting(true);
    try {
      const res = await createMeetingAction({
        dealId,
        title,
        scheduledAt: new Date(scheduledAt),
        location,
      });
      if (res?.data) {
        toast.success("Meeting scheduled");
        setOpen(false);
        setTitle("");
        setScheduledAt("");
        setLocation("");
      } else {
        toast.error(res?.serverError || "Failed to schedule meeting");
      }
    } catch {
      toast.error("Failed to schedule meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Upcoming Meetings</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild nativeButton={true}>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Discovery Call" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location / Link</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Google Meet link or Address" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {meetings.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
            <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No meetings scheduled.</p>
          </div>
        ) : (
          meetings.map(m => (
            <div key={m.id} className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{m.title}</h4>
                  <Badge variant={m.status === 'completed' ? 'secondary' : 'default'} className="text-[10px] h-5 capitalize">
                    {m.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(m.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  {m.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{m.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
