"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "@uploadthing/react";
import { useUploadThing } from "@/modules/uploads/client";
import { toast } from "sonner";
import { Upload, Loader2, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

export function FileUploadDropzone({
  orgId,
  onComplete,
}: {
  orgId: string;
  onComplete?: () => void;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing("orgFileUpload", {
    onClientUploadComplete: () => {
      setFiles([]);
      setUploadProgress(0);
      toast.success("Files uploaded successfully.");
      router.refresh();
      onComplete?.();
    },
    onUploadError: (error) => {
      setUploadProgress(0);
      toast.error(error.message || "Upload failed.");
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 5,
    disabled: isUploading,
  });

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpload() {
    if (files.length === 0) return;
    startUpload(files, { orgId });
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragActive ? "Drop files here" : "Drag & drop files here, or click to select"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images (JPEG, PNG, WebP, GIF) and PDFs up to 10MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border p-2"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isUploading && <Progress value={uploadProgress} />}

      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
          )}
        </Button>
      )}
    </div>
  );
}
