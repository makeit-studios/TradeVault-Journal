"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  name: string;
  label: string;
}

export function ImageUpload({ name, label }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80"
      />
      {preview ? (
        <div className="relative mt-2 h-48 w-full rounded-md border border-border bg-black/20">
          <Image src={preview} alt={label} fill className="object-contain" />
        </div>
      ) : null}
    </div>
  );
}
