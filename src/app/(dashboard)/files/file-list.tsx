"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteFile } from "@/modules/uploads/actions";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { FileUploadDropzone } from "@/components/uploads/file-upload-dropzone";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  FileText,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";

type FileItem = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  category: string;
  createdAt: Date;
  userId: string | null;
  user: { id: string; name: string | null; email: string } | null;
};

export function FileList({
  files,
  orgId,
  currentUserId,
  canUpload,
  canDeleteAny,
  storageUsed,
  storageLimit,
  fileCount,
}: {
  files: FileItem[];
  orgId: string;
  currentUserId: string;
  canUpload: boolean;
  canDeleteAny: boolean;
  storageUsed: number;
  storageLimit: number;
  fileCount: number;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const storagePercent = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

  async function handleDelete() {
    if (!fileToDelete) return;
    const result = await deleteFile(orgId, fileToDelete.id);
    if (result.success) {
      toast.success("File deleted.");
    } else {
      toast.error(result.error);
    }
  }

  function canDelete(file: FileItem) {
    return canDeleteAny || file.userId === currentUserId;
  }

  function getFileIcon(type: string) {
    if (type.startsWith("image/")) return ImageIcon;
    return FileText;
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Storage</CardTitle>
            <CardDescription>
              {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
              {fileCount > 0 && ` (${fileCount} file${fileCount > 1 ? "s" : ""})`}
            </CardDescription>
          </div>
          {canUpload && (
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="mr-2 h-4 w-4" />
                Upload
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload files</DialogTitle>
                  <DialogDescription>
                    Upload images or PDFs to your organization.
                  </DialogDescription>
                </DialogHeader>
                <FileUploadDropzone
                  orgId={orgId}
                  onComplete={() => setUploadOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Progress value={storagePercent} />
        </CardContent>
      </Card>

      {files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No files yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload your first file to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);

            return (
              <Card key={file.id} className="overflow-hidden">
                <div className="flex h-32 items-center justify-center bg-muted">
                  {file.type.startsWith("image/") ? (
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={200}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} &middot; {formatDate(file.createdAt)}
                      </p>
                      {file.user && (
                        <p className="truncate text-xs text-muted-foreground">
                          {file.user.name ?? file.user.email}
                        </p>
                      )}
                    </div>
                    {canDelete(file) && (
                      <button
                        type="button"
                        onClick={() => setFileToDelete(file)}
                        className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!fileToDelete}
        onOpenChange={(open) => { if (!open) setFileToDelete(null); }}
        title="Delete file"
        description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
