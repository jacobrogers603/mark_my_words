"use client";
import axios from "axios";
import { ArrowDownFromLine, NotebookText } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

interface NoteIdentifier {
  title: string;
  id: string;
  noteCreator: User;
  readAccessList: string[];
  writeAccessList: string[];
}

type SharedItemProps = {
  note: NoteIdentifier;
  currentUser: User;
};

interface User {
  id: string;
  email: string;
  username: string;
}

const SharedItem = ({ note, currentUser }: SharedItemProps) => {
  const router = useRouter();

  const handleItemClick = () => {
    router.push(`/note/${note.id.toString()}`);
  };

  const handleEditClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    router.push(`/editor/${note.id}`);
  };

  const handleDownloadClick = async (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    try {
      // Get the entire note including its content
      var noteContent: string = "";
      try {
        const response = await axios.get(`/api/getNote/${note.id}`);
        noteContent = response.data.content;
      } catch (error) {
        console.error("Failed to download note", error);
        return;
      }
      // Ensuring content is converted to a string in all cases
      const contentAsString: string =
        typeof noteContent === "object"
          ? JSON.stringify(noteContent)
          : String(noteContent);

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
  };

  const currentUserCanEdit = note.writeAccessList.includes(currentUser.email);

  return (
    <main className="grid grid-cols-8 place-items-center w-full h-10 border-solid rounded-md border-black border-2 text-black font-normal cursor-pointer mb-2 bg-blue-100 hover:bg-blue-200" onClick={handleItemClick}>
      <NotebookText />
      <div className="col-start-2 col-end-4 overflow-auto whitespace-nowrap w-full">
        {note?.title?.toString() ?? "No title"}
      </div>
      <div className="col-start-5 col-end-6 overflow-auto whitespace-nowrap w-full">
        {/* {`${note.noteCreator.email}` + " (" + `${note.noteCreator.username}` + ")"} */}
        {`${note.noteCreator.email}`}
      </div>
      {currentUserCanEdit ? (
        <div
          className="grid place-items-center w-full h-full z-100 col-start-6"
          onClick={handleEditClick}>
          <FaEdit size={20} />
        </div>
      ) : null}
      <div
        className="grid place-items-center w-full h-full z-100 col-start-7"
        onClick={handleDownloadClick}>
        <ArrowDownFromLine />
      </div>
    </main>
  );
};

export default SharedItem;
