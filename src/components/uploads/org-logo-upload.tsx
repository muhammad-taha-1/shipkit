"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/modules/uploads/client";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";

export function OrgLogoUpload({
  currentLogo,
  orgName,
  orgId,
}: {
  currentLogo: string | null;
  orgName: string;
  orgId: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("orgLogoUpload", {
    onClientUploadComplete: () => {
      setIsUploading(false);
      toast.success("Logo updated.");
      router.refresh();
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(error.message || "Upload failed.");
    },
  });

  function handleClick() {
    if (!isUploading) {
      inputRef.current?.click();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setIsUploading(true);
    startUpload([file], { orgId });
    e.target.value = "";
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled={isUploading}
      >
        {currentLogo ? (
          <Image
            src={currentLogo}
            alt={orgName}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-muted-foreground">
            {orgName[0]?.toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <ImagePlus className="h-5 w-5 text-white" />
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
