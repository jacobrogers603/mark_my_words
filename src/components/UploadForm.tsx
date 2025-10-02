"use client";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { set } from "react-hook-form";
import axios from "axios";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

interface UploadFormProps {
  onUploadComplete: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({onUploadComplete}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const validateFileType = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    return validTypes.includes(file.type);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setUploadMessage("No file selected.");
      setTimeout(() => setUploadMessage(""), 3000);
      return;
    }

    if (!validateFileType(file)) {
      setUploadMessage("File type must be PNG, JPG, or JPEG.");
      setTimeout(() => setUploadMessage(""), 3000);
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = axios.post("/api/mediaUpload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadMessage("Image uploaded");
      setTimeout(() => {
        setUploadMessage("");
        onUploadComplete();
      }, 3000);
    } catch (error) {
      setUploadMessage("Failed to upload image");
      console.log("An error occurred while uploading the file.", error);
    } finally {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploading(false);
    }
  };

  return (
    <main className="rounded-md w-fit h-fit">
      <form
        method="POST"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center w-fit">
        <Label htmlFor="picture" className="font-bold mb-4">
          Select an image
        </Label>
        <Input
          type="file"
          name="file"
          accept="image/png, image/jpg, image/jpeg"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="mb-4"
        />
        {uploadMessage && (
          <div
            className={`mb-4 ${
              uploadMessage === "Image uploaded"
                ? "text-green-600"
                : "text-red-600"
            }`}>
            {uploadMessage}
          </div>
        )}
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </main>
  );
};

export default UploadForm;
