"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <Button onClick={() => window.print()}>
      <Printer className="w-4 h-4 mr-2" />
      Print / Save as PDF
    </Button>
  );
}
