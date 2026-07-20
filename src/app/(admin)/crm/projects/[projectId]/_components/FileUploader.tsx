"use client";

import React from 'react';
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useRouter } from "next/navigation";

export default function FileUploader({ endpoint, projectId, retainerPeriodId }: { endpoint: keyof OurFileRouter, projectId?: string, retainerPeriodId?: string }) {
  const router = useRouter();

  const [progress, setProgress] = React.useState<number>(0);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center">
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      <UploadDropzone<OurFileRouter, keyof OurFileRouter>
        endpoint={endpoint}
        input={{ projectId, retainerPeriodId }}
        onUploadProgress={(p) => {
          setProgress(p);
        }}
        onClientUploadComplete={(res) => {
          setProgress(0);
          console.log("Files: ", res);
          alert("Upload Completed");
          router.refresh();
        }}
        onUploadError={(error: Error) => {
          setProgress(0);
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}
