import React, { useEffect } from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";
import useNote from "@/hooks/useNote";
import axios from "axios";

interface DirectoryItemsProps {
  currentDirNotes: JsonObject[] | null;
  currentPath: string[] | null;
  onDirectoryChange: () => void;
}

export const DirectoryItems: React.FC<DirectoryItemsProps> = ({
  currentDirNotes,
  currentPath,
  onDirectoryChange,
}) => {
  const getCurrentPathString = () => {
    if (currentPath === null) {
      return "null path";
    }

    let path = "";
    for (let i = 0; i < currentPath.length; i++) {
      const { data: note } = useNote(currentPath[i] as string);
      if (note?.title === undefined) {
        path += "loading...";
      } else {
        path += note.title;
      }
      if (i < currentPath.length - 1) {
        path += " / ";
      }
    }
    return path;
  };

  const path = getCurrentPathString();

  // Go back up one directory.
  const cdUp = async () => {
    try {
      await axios.delete("/api/setCurrentPath");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main>
      <h2>{path}</h2>
      {currentPath?.length ?? 0 > 1 ? (
        <div
          className="grid place-items-center w-64 h-10 border-solid rounded-md border-2 border-red-500"
          onClick={cdUp}
        >
          ...
        </div>
      ) : null}
      {currentDirNotes &&
        currentDirNotes.map((note) => (
          <DirectoryItem
            key={note.id?.toString()}
            note={note ?? null}
          />
        ))}
    </main>
  );
};

export default DirectoryItems;