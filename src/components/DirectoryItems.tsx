import React from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";


const DirectoryItems = ({currentDirNotes}: {currentDirNotes: JsonObject[] | null}) => {
  return (
    <main>
      {currentDirNotes && currentDirNotes.map((note) => (
        <DirectoryItem note={note ?? null} />
      ))}
    </main>
  );
};

export default DirectoryItems;
