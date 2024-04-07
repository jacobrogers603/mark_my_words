import { JsonObject } from "@prisma/client/runtime/library";
import { useRouter } from "next/navigation";
import React from "react";
import { FaFolderClosed } from "react-icons/fa6";
import { PiNoteFill } from "react-icons/pi";
import { FaEdit } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { NotebookText, FolderClosed, ArrowDownFromLine } from "lucide-react";

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
    } else {
      handleItemClick();
    }
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    router.push(`/note/settings/${note.id}`);
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (note.isDirectory) {
      try {
        
      } catch (error) {
        console.log("Failed to download directory", error);
        return;
      }
    } else {
      try {
        // Ensuring content is converted to a string in all cases
        const contentAsString: string =
          typeof note.content === "object"
            ? JSON.stringify(note.content)
            : String(note.content);

        // Proceed with Blob creation and downloading logic
        const blob: Blob = new Blob([contentAsString], {
          type: "text/markdown;charset=utf-8",
        });
        const url: string = URL.createObjectURL(blob);
        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.href = url;
        anchor.download = `${note.title}.md`;

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(url);
      } catch (error) {
        console.log("Failed to download note", error);
        return;
      }
    }
  };
  

  return (
    <div
      onClick={handleItemClick}
      className={`grid grid-cols-8 place-items-center w-full h-10 border-solid rounded-md border-black border-2 text-black font-normal cursor-pointer mb-2 ${
        note.isDirectory
          ? "bg-amber-400 hover:bg-amber-500"
          : "bg-blue-100 hover:bg-blue-200"
      } `}>
      <div className="">
        {note.isDirectory ? <FolderClosed /> : <NotebookText />}
      </div>
      <div className="col-start-2 col-end-5">
        {note?.title?.toString() ?? "No title"}
      </div>
      <div
        className="grid place-items-center w-full h-full z-100 col-start-6"
        onClick={handleEditClick}>
        <div className="">
          {!note.isDirectory ? <FaEdit size={20} /> : null}
        </div>
      </div>
      <div
        className="grid place-items-center w-full h-full z-100 col-start-7"
        onClick={handleDownloadClick}>
        <ArrowDownFromLine />
      </div>

      <div
        className="grid place-items-center w-full h-full z-100 col-start-8"
        onClick={handleSettingsClick}>
        <IoSettingsSharp />
      </div>
    </div>
  );
};

export default DirectoryItem;
