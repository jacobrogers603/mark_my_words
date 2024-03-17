import React from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";
import useCurrentPath from "@/hooks/useCurrentPath";
import axios from "axios";
import useNote from "@/hooks/useNote";

interface DirectoryItemsProps {
  currentDirNotes: JsonObject[] | null;
  currentPath: string[] | null;
}

const DirectoryItems: React.FC<DirectoryItemsProps> = ({
  currentDirNotes,
  currentPath,
}) => {

  const getCurrentPathString = () => {
    if (currentPath === null) {
      return "null path";
    }

    let path = "";
    for (let i = 0; i < currentPath.length; i++) {
      const { data: note } = useNote(currentPath[i] as string);
      path += note?.title;

      if(i < currentPath.length - 1) {
        path += "/";
      }
    }


    return path;
  };

  const path = getCurrentPathString();

  return (
    <main>
      <h2>{path}</h2>
      {currentDirNotes &&
        currentDirNotes.map((note) => (
          <DirectoryItem key={note.id?.toString()} note={note ?? null} />
        ))}
    </main>
  );
};

export default DirectoryItems;
