"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAction } from "next-safe-action/hooks";
import { publicApproveProposalAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { PenTool } from "lucide-react";
import Link from "next/link";

export function ProposalSignatureClient({ proposalId, organizationName, sig, expires }: { proposalId: string, organizationName: string, sig?: string, expires?: string }) {
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);

  const { execute, isExecuting } = useAction(publicApproveProposalAction, {
    onSuccess: () => {
      toast.success("Proposal approved successfully!");
    },
    onError: () => {
      toast.error("Failed to approve proposal");
    }
  });

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("You must agree to the terms.");
      return;
    }
    if (signature.trim().length < 2) {
      toast.error("Please enter your full name as signature.");
      return;
    }
    
    execute({
      proposalId,
      sig: sig || "",
      expires: expires || "",
      signatureText: signature,
      ipAddress: "127.0.0.1", // Mocked IP for now
    });
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardContent className="p-6 sm:p-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-primary" />
          Digital Signature
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          By signing below, you agree to the scope of work and investment detailed above on behalf of <strong>{organizationName}</strong>.
        </p>

        <form onSubmit={handleApprove} className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="signature">Full Name</Label>
            <Input 
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="e.g. Walter White"
              required
              className="font-serif text-lg bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={agreed}
              onCheckedChange={(c) => setAgreed(c as boolean)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">terms and conditions</Link>
              </label>
              <p className="text-xs text-muted-foreground">
                This digital signature holds the same legal weight as a handwritten signature.
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full sm:w-auto min-w-[200px]"
            disabled={isExecuting || !agreed || signature.length < 2}
          >
            {isExecuting ? "Processing..." : "Approve & Sign Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
