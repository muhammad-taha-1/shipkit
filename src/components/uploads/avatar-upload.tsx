"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/modules/uploads/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

export function AvatarUpload({
  currentImage,
  userName,
  userEmail,
}: {
  currentImage: string | null;
  userName: string | null;
  userEmail: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("avatarUpload", {
    onClientUploadComplete: () => {
      setIsUploading(false);
      toast.success("Avatar updated.");
      router.refresh();
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(error.message || "Upload failed.");
    },
  });

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail[0].toUpperCase();

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
    startUpload([file]);
    e.target.value = "";
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="group relative cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled={isUploading}
      >
        <Avatar size="lg" className="h-20 w-20">
          {currentImage && <AvatarImage src={currentImage} alt={userName ?? "Avatar"} />}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
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
