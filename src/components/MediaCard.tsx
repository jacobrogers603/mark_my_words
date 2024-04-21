import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Info, X } from "lucide-react";

interface MediaFile {
  key: string;
  title: string;
  lastModified: string;
}

interface MediaCardProps {
  file: MediaFile;
  deleteMedia: (key: string) => void;
}

const MediaCard = ({ file, deleteMedia }: MediaCardProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <Card
      className={`w-[10rem] h-[10rem] overflow-hidden cursor-default text-gray-600 relative ${showInfo ? "bg-gray-200" : ""}`}
      key={file.key}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <CardContent className="flex flex-col items-center justify-center h-full w-full p-0 m-0">
        {(hover && !showInfo) && (
          <div
            className="absolute inset-0 bg-gray-200 opacity-50 z-10"
            style={{ borderRadius: "inherit" }} // Ensures the overlay has the same rounded corners as the card
          ></div>
        )}
        {!showInfo && (
          <X
            size={25}
            onClick={() => deleteMedia(file.key)}
            className="absolute top-2 right-2 cursor-pointer text-black hover:text-red-500 z-20"
          />
        )}
        <Info
          size={25}
          className="absolute top-2 left-2 cursor-pointer text-black rounded-full z-20"
          onClick={() => setShowInfo(!showInfo)}
        />
        {showInfo ? (
          <>
            <h2 className="text-center mt-6 w-full mx-2 overflow-auto h-12 z-20">
              {file.title}
            </h2>
            <p className="text-center mt-2 w-full mx-2 overflow-auto h-12 z-20">
              {file.lastModified}
            </p>
          </>
        ) : (
          <img
            src={`https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${file.key}`}
            alt={file.title}
            className="object-cover w-full h-full rounded-md"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
