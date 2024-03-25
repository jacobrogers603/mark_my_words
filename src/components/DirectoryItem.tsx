import { JsonObject } from "@prisma/client/runtime/library";
import { useRouter } from "next/navigation";
import React from "react";

type DirectoryItemProps = {
  note: JsonObject;
  updateCurrentPath: (directoryId?: string) => Promise<void>;
};

const DirectoryItem = ({ note, updateCurrentPath }: DirectoryItemProps) => {
  const router = useRouter();

  const handleItemClick = async () => {
    const noteId = note?.id;
    if (note.isDirectory) {
      await updateCurrentPath(noteId?.toString());
    } else {
      router.push(`/note/${noteId?.toString()}`);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className="grid place-items-center w-64 h-10 border-solid rounded-md border-2 border-amber-500">
      {note?.title?.toString() ?? "No title"}
    </div>
  );
};

export default DirectoryItem;
