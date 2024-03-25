import React, { useEffect, useState } from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";
import axios from "axios";

interface DirectoryItemsProps {
  currentDirNotes: JsonObject[] | null;
  currentPath: string[] | null;
  updateCurrentPath: (directoryId?: string) => Promise<void>;
}

export const DirectoryItems: React.FC<DirectoryItemsProps> = ({
  currentDirNotes,
  currentPath,
  updateCurrentPath,
}) => {
  const [notes, setNotes] = useState<JsonObject[]>([]);
  const [pathTitles, setPathTitles] = useState<string[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get("/api/getCurrentDirectory");
        setNotes(response.data);
      } catch (error) {
        console.log("Failed to fetch notes", error);
      }
    };

    fetchNotes();
  }, [currentPath]);

  useEffect(() => {
    const fetchPathTitles = async () => {
      if (currentPath) {
        const titles = await Promise.all(
          currentPath.map(async (directoryId) => {
            try {
              const response = await axios.get(`/api/getNote/${directoryId}`);
              return response.data.title || "";
            } catch (error) {
              console.error("Failed to fetch note:", error);
              return "";
            }
          })
        );
        setPathTitles(titles);
      }
    };

    fetchPathTitles();
  }, [currentPath]);

  const path = pathTitles.join(" / ");

  return (
    <main>
      <h2>{path}</h2>
      {currentPath && currentPath.length > 1 ? (
        <div
          className="grid place-items-center w-64 h-10 border-solid rounded-md border-2 border-red-500"
          onClick={() => updateCurrentPath()}>
          ...
        </div>
      ) : null}
      {notes.map((note) => (
        <DirectoryItem
          key={note.id?.toString()}
          note={note ?? null}
          updateCurrentPath={updateCurrentPath}
        />
      ))}
    </main>
  );
};

export default DirectoryItems;
