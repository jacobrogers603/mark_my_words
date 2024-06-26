import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Info, X } from "lucide-react";

// Define the interface for the MediaFile
interface MediaFile {
  key: string;
  blob: Blob;
  lastModified: Date;
}

// Define the interface for the component props
interface MediaCardProps {
  file: MediaFile;
  deleteMedia?: (key: string) => void;
  editor: boolean;
  appendImageLink?: (altText: string, link: string) => void;
  currentUserId?: string;
  noteId?: string;
  closeDrawer?: () => void;
  handleTextAreaChange?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  file,
  deleteMedia,
  editor,
  appendImageLink,
  currentUserId,
  noteId,
  closeDrawer,
  handleTextAreaChange,
}) => {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    // Regex to match the filename pattern and capture the needed parts
    const pattern = /^(.+)-id=\d+(\.\w+)$/;
    const match = file.key.match(pattern);

    // If the pattern matches, recombine the filename parts excluding the id section
    const titleWithExtension = match ? `${match[1]}${match[2]}` : file.key;

    setTitle(titleWithExtension);
    const url = URL.createObjectURL(file.blob);
    setImageUrl(url);

    // Cleanup function to revoke the blob URL
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleClick = () => {
    if (editor && appendImageLink && noteId) {
      if (!currentUserId || !file.key) {
        return;
      }

      const link =
        "https://mark-my-words.net/api/getImage/" +
        currentUserId +
        "/" +
        file.key +
        "/" +
        noteId;

      appendImageLink(title, link);
      
      if(handleTextAreaChange) {
        handleTextAreaChange();
      }

      if(closeDrawer) {
        closeDrawer();
      }
    }
  };

  const handleDelete = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!editor && deleteMedia) {
      deleteMedia(file.key);
    }
  };

  const handleInfoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setShowInfo(!showInfo);
  };

  return (
    <Card
      className={`w-[10rem] h-[10rem] overflow-hidden cursor-default text-gray-600 relative ${
        showInfo ? "bg-gray-200" : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}>
      <CardContent className="flex flex-col items-center justify-center h-full w-full p-0 m-0">
        {hover && !showInfo && (
          <div
            className="absolute inset-0 bg-gray-200 opacity-50 z-10"
            style={{ borderRadius: "inherit" }}
          />
        )}
        {!showInfo && !editor && (
          <div className="w-fit h-hit" onClick={handleDelete}>
            <X
              size={25}
              className="absolute top-2 right-2 cursor-pointer text-black hover:text-red-500 z-20"
            />
          </div>
        )}
        <div className="w-fit h-hit" onClick={handleInfoClick}>
          <Info
            size={25}
            className="absolute top-2 left-2 cursor-pointer text-black rounded-full z-20"
          />
        </div>
        {showInfo ? (
          <>
            <h2 className="text-center mt-6 w-full mx-2 overflow-auto h-12 z-20">
              {title}
            </h2>
            <p className="text-center mt-2 w-full mx-2 overflow-auto h-12 z-20">
              {file.lastModified.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </p>
          </>
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full rounded-md"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
