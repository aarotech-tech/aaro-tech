"use client";

import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { toPaise } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { FileText, Send, Plus, Trash2, CheckCircle, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  addDealLineItemAction, 
  removeDealLineItemAction,
  generateProposalDocumentAction,
  sendProposalAction 
} from "@/modules/sales/actions";

export function ProposalEditorClient({ proposal, currentLineItems, dealId }: { proposal: any, currentLineItems: any[], dealId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<string | number>("1");
  const [unitPrice, setUnitPrice] = useState<string | number>("");

  const { execute: addLineItem, isExecuting: isAdding } = useAction(addDealLineItemAction, {
    onSuccess: () => {
      toast.success("Line item added");
      setTitle("");
      setDescription("");
      setQuantity("1");
      setUnitPrice("");
      router.refresh();
    },
    onError: ({ error }) => {
      console.log("Action Error:", error);
      if (error?.serverError) {
        toast.error(error.serverError);
      } else if (error?.validationErrors) {
        toast.error("Validation Error: " + JSON.stringify(error.validationErrors));
      } else {
        toast.error("Failed to add line item. Check console.");
      }
    }
  });

  const { execute: removeLineItem, isExecuting: isRemoving } = useAction(removeDealLineItemAction, {
    onSuccess: () => {
      toast.success("Line item removed");
      router.refresh();
    },
    onError: ({ error }) => toast.error(error?.serverError || "Failed to remove line item")
  });

  const { execute: generateDoc, isExecuting: isGenerating } = useAction(generateProposalDocumentAction, {
    onSuccess: () => {
      toast.success("Proposal document generated!");
      router.refresh();
    },
    onError: ({ error }) => toast.error(error?.serverError || "Failed to generate document")
  });

  const { execute: sendDoc, isExecuting: isSending } = useAction(sendProposalAction, {
    onSuccess: (res) => {
      toast.success("Proposal sent to client!");
      console.log("Client Portal Link:", res.data?.portalLink);
    },
    onError: () => toast.error("Failed to send proposal")
  });

  const handleAddLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    addLineItem({
      dealId,
      title,
      description,
      quantity: Number(quantity) || 1,
      unitPrice: toPaise(Number(unitPrice) || 0), // to cents
      isRecurring: false,
    });
  };

  const totalValue = currentLineItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Line Items Manager */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scope of Work</CardTitle>
            <CardDescription>Manage line items to calculate the deal value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLineItems.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No line items added yet.</p>
            ) : (
              <div className="space-y-3">
                {currentLineItems.map(item => (
                  <div key={item.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                      <p className="text-xs font-semibold text-primary mt-1">
                        {item.quantity} x ₹{(item.unitPrice / 100).toLocaleString()} = ₹{(item.total / 100).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeLineItem({ lineItemId: item.id, dealId })}
                      disabled={isRemoving || proposal.status !== "draft"}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="font-semibold text-sm">Total Value</span>
                  <span className="font-bold text-lg text-primary">₹{(totalValue / 100).toLocaleString()}</span>
                </div>
              </div>
            )}

            {proposal.status === "draft" && (
              <form onSubmit={handleAddLineItem} className="pt-4 border-t space-y-3">
                <div>
                  <Label>Service Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. SEO Audit" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details..." />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Qty</Label>
                    <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                  </div>
                  <div className="flex-1">
                    <Label>Unit Price (₹)</Label>
                    <Input type="number" min="0" step="any" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isAdding || !title || Number(unitPrice) < 0} variant="secondary">
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Proposal Document View */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Document Preview
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-gray-50">{proposal.status}</Badge>
                {proposal.approvedAt && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" /> Approved
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {proposal.status === "draft" && (
                <Button 
                  variant="outline" 
                  onClick={() => generateDoc({ 
                    proposalId: proposal.id, 
                    dealId, 
                    dealName: proposal.dealName, 
                    orgName: proposal.organizationName 
                  })}
                  disabled={isGenerating}
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate AI Document
                </Button>
              )}
              
              {proposal.status === "draft" && proposal.documentData && (
                <Button 
                  className="bg-primary text-white"
                  onClick={() => sendDoc({ proposalId: proposal.id, dealId })}
                  disabled={isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? "Sending..." : "Send to Client"}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-gray-100">
            {!proposal.documentData ? (
              <div className="h-96 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-500">No Document Generated</p>
                <p className="text-sm mt-2">Add your line items on the left, then click "Generate AI Document" to create the proposal.</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-8 lg:p-12">
                <div className="max-w-3xl mx-auto bg-white p-8 lg:p-12 rounded-lg shadow-sm min-h-[800px]" 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(proposal.documentData) }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
