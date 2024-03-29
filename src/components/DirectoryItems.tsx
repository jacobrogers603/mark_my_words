import React, { useEffect, useState } from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";
import axios from "axios";
import { FaFolderClosed } from "react-icons/fa6";

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
        const response = await axios.get("/api/getCurrentDirectoryNotes");
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

  const formatPath = (titles: string[]) => {
    if (titles.length === 0) {
      return "";
    }

    const formattedTitles = titles.map((title, index) => {
      if (index === 0) {
        return `${title}:/ `;
      }
      return title;
    });

    return formattedTitles[0] + formattedTitles.slice(1).join(" / ");
  };

  const path = formatPath(pathTitles);

  // Separate directories and notes
  const dirNotes = notes.filter((note) => note.isDirectory == true);
  const nonDirNotes = notes.filter((note) => note.isDirectory == false);

  return (
    <main className="w-[50%]">
      <h2 className="font-bold m-8 p-2 border-solid border-gray-600 text-gray-600 border-2 rounded-md">
        {path}
      </h2>

      {currentPath && currentPath.length > 1 ? (
        <div
          className="grid place-items-center grid-cols-8 w-full h-10 border-solid rounded-md border-2 bg-blue-400 border-black cursor-pointer mb-2 font-extrabold"
          onClick={() => updateCurrentPath()}>
          <FaFolderClosed />
          <span className="col-start-2 col-end-5">↑ . . .</span>
        </div>
      ) : null}

      {/* Render directories first */}
      {dirNotes.map((note) => (
        <DirectoryItem
          key={note.id?.toString()}
          note={note ?? null}
          updateCurrentPath={updateCurrentPath}
        />
      ))}

      {/* Render non-directory notes */}
      {nonDirNotes.map((note) => (
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
