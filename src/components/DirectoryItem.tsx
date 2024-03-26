import { JsonObject } from "@prisma/client/runtime/library";
import { useRouter } from "next/navigation";
import React from "react";
import { FaFolderClosed } from "react-icons/fa6";
import { PiNoteFill } from "react-icons/pi";
import { FaEdit } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

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

  const handleEditClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!note.isDirectory) {
      router.push(`/editor/${note.id}`);
    }else{
      handleItemClick();
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className="grid grid-cols-4 place-items-center w-full h-10 border-solid rounded-md border-2 border-amber-500 cursor-pointer "
    >
      <div className="">{note.isDirectory ? <FaFolderClosed /> : <PiNoteFill />}</div>
      <div className="grid-span-2">{note?.title?.toString() ?? "No title"}</div>
      <div
        className="grid place-items-center w-full h-full border-solid border-2 border-green-300 z-100"
        onClick={handleEditClick}
      >
        <div className="">{!note.isDirectory ? <FaEdit size={20} /> : null}</div>
      </div>
      <IoSettingsSharp />
    </div>
  );
};

export default DirectoryItem;
