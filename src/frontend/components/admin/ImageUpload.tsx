"use client";

import { useState, useRef } from "react";
import { ImagePlus, Trash, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  maxFiles?: number;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  maxFiles = 10
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        // Prevent exceeding maxFiles limit
        if (value.length + uploadedUrls.length >= maxFiles) {
          alert(`Maximum file upload limit of ${maxFiles} reached.`);
          break;
        }

        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/cloudinary", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to upload image.");
        }

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        if (maxFiles === 1) {
          onChange([uploadedUrls[0]]);
        } else {
          onChange([...value, ...uploadedUrls]);
        }
      }
    } catch (error: any) {
      console.error("Upload error details:", error);
      alert(error.message || "An error occurred during file upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-2xl overflow-hidden border border-border group hover:shadow-md transition-shadow">
            <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition cursor-pointer"
                title="Remove image"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Product Image"
              src={url}
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </div>
        ))}
      </div>
      
      {value.length < maxFiles && (
        <>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple={maxFiles > 1}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading || value.length >= maxFiles}
            onClick={triggerUpload}
            className="border-2 border-dashed border-border flex flex-col items-center justify-center rounded-2xl p-8 hover:bg-secondary/40 transition-colors w-full bg-secondary/10 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                <span className="font-semibold text-foreground">Uploading files to Cloudinary...</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="font-semibold text-foreground">Click to upload product media</span>
                <span className="text-xs text-muted-foreground mt-1">Upload up to {maxFiles} images (supported format: JPG, PNG, WEBP)</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
