import { JsonObject } from "@prisma/client/runtime/library";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type DirectoryItemsProps = {
  note: JsonObject;
};

const DirectoryItem = ({ note }: DirectoryItemsProps) => {

  const router = useRouter();

  const handleItemClick = () => {
    const noteId = note?.id;
    if(note.isDirectory) {
      console.log('change the current dir');
    }
    else {
      router.push(`/note/${noteId?.toString()}`);
    }
  };

  return (
      <div onClick={handleItemClick} className="grid place-items-center w-64 h-10 border-solid rounded-md border-2 border-amber-500">
        {note?.title?.toString() ?? 'No title'}
      </div>
  );
};

export default DirectoryItem;
