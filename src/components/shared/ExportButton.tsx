"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV string
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return "";
        const str = String(val).replace(/"/g, '""');
        // Quote strings containing commas, newlines, or quotes
        if (str.includes(",") || str.includes("\\n") || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      });
      csvRows.push(values.join(","));
    }
    
    const csvString = csvRows.join("\\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    
    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  );
}
