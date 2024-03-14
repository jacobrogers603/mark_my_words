import React from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";
import { useRouter } from "next/router";


const DirectoryItems = ({currentDirNotes}: {currentDirNotes: JsonObject[] | null}) => {

  return (
    <main>
      {currentDirNotes && currentDirNotes.map((note) => (
        <DirectoryItem key={note.id?.toString()} note={note ?? null} />
      ))}
    </main>
  );
};

export default DirectoryItems;
