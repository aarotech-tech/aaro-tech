"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { convertLeadToDeal } from "@/actions/leads";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function LeadsTable({ leads }: { leads: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConvert = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await convertLeadToDeal(id);
      if (res.success) {
        toast.success("Lead successfully converted to prospect. Create a deal in the pipeline to proceed.");
      }
    } catch (err) {
      toast.error("Failed to convert lead");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-md border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization / Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <Badge variant={lead.status === 'lead' ? 'secondary' : 'default'}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {lead.status === 'lead' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConvert(lead.id)}
                      disabled={loadingId === lead.id}
                    >
                      {loadingId === lead.id ? "Converting..." : "Convert to Deal"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
