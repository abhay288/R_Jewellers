"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash, X } from "lucide-react";
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
  maxFiles = 5
}: ImageUploadProps) {
  
  const onUpload = (result: any) => {
    if (result.info.secure_url) {
      if (maxFiles === 1) {
        onChange([result.info.secure_url]);
      } else {
        onChange([...value, result.info.secure_url]);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-border">
            <div className="z-10 absolute top-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      
      {value.length < maxFiles && (
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "demo" ? (
          <CldUploadWidget 
            onSuccess={onUpload} 
            uploadPreset="radhika_jewellers_preset"
            options={{
              maxFiles: maxFiles === 1 ? 1 : maxFiles - value.length,
            }}
          >
            {({ open }) => {
              const onClick = (e: React.MouseEvent) => {
                e.preventDefault();
                open();
              };

              return (
                <button
                  type="button"
                  disabled={value.length >= maxFiles}
                  onClick={onClick}
                  className="border-2 border-dashed border-border flex flex-col items-center justify-center rounded-xl p-6 hover:bg-secondary/50 transition-colors w-full bg-secondary/20"
                >
                  <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="font-medium">Click to upload images</span>
                  <span className="text-xs text-muted-foreground mt-1">Upload up to {maxFiles} images</span>
                </button>
              );
            }}
          </CldUploadWidget>
        ) : (
          <button
            type="button"
            disabled={value.length >= maxFiles}
            onClick={(e) => {
              e.preventDefault();
              const dummyUrl = `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400&h=400&random=${Math.random()}`;
              if (maxFiles === 1) {
                onChange([dummyUrl]);
              } else {
                onChange([...value, dummyUrl]);
              }
            }}
            className="border-2 border-dashed border-border flex flex-col items-center justify-center rounded-xl p-6 hover:bg-secondary/50 transition-colors w-full bg-secondary/20"
          >
            <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="font-medium">Click to add placeholder image</span>
            <span className="text-xs text-orange-500 mt-1 font-medium">Cloudinary not configured. Adds dummy image for testing.</span>
          </button>
        )
      )}
    </div>
  );
}
