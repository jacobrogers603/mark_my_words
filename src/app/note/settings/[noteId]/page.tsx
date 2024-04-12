"use client";
import NavBar from "@/components/NavBar";
import useNote from "@/hooks/useNote";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownFromLine, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaEdit } from "react-icons/fa";

const NoteSettings = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const router = useRouter();
  const { noteId } = useParams();
  const { data: note } = useNote(noteId as string);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => setIsDialogOpen(false);

  const deleteButtonPressed = () => {
    setIsDialogOpen(true);
  };

  const routeHome = () => {
    router.push("/");
  };

  const routeEditor = () => {
    router.push(`/editor/${noteId}`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete("/api/saveNote", {
        data: {
          noteId: noteId,
        },
      });
    } catch (error) {
      console.log(error);
    }
    routeHome();
  };

  const handleDownloadHtmlPress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (note.isDirectory) {
      try {
        // Directory download logic (if applicable)
      } catch (error) {
        console.error("Failed to download directory", error);
      }
    } else {
      try {
        const content = note.htmlContent; // Assuming this is HTML content as a string
        const blob: Blob = new Blob([content], {
          type: "text/html;charset=utf-8",
        });
        const url: string = URL.createObjectURL(blob);
        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.href = url;
        anchor.download = `${note.title}.html`;

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download note", error);
      }
    }
  };

  if (status === "loading") {
    return (
      <main className="w-full h-screen grid place-items-center">
        <div className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main
      className={`flex flex-col justify-start items-center w-full h-screen ${
        note?.isDirectory ? "bg-amber-100" : "bg-blue-100"
      }`}>
      <NavBar />
      {/* Delete confirmation dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen}>
          <DialogContent className="w-auto grid place-items-center text-center max-w-[18rem] rounded-md">
            <DialogHeader className="text-center max-w-full">
              <DialogTitle className="text-center">{`Delete ${
                note?.isDirectory ? "directory" : "note"
              }?`}</DialogTitle>
              <DialogDescription className="text-center">
                {`A deleted ${
                  note?.isDirectory ? "directory" : "note"
                } cannot be recovered. Are you sure you want to delete it? ${
                  note?.isDirectory
                    ? "This will also delete its notes and subdirectories."
                    : ""
                }`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex">
              <Button className="w-[50%]" onClick={closeDialog}>
                Return
              </Button>
              <Button
                className="ml-2 w-[50%]"
                variant="destructive"
                onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col mx-8 max-w-[80%] md:max-w-[60%]">
        <h1 className="mt-16 mb-4 font-medium text-xl md:text-3xl text-black text-center">
          {note?.isDirectory ? "Directory" : "Note"}&nbsp;Settings:
        </h1>

        <div className="mb-4 overflow-x-auto">
          <span className="text-gray-600 italic text-xl md:text-3xl whitespace-nowrap text-start">
            {note?.title}
          </span>
        </div>
      </div>

      {/* Access controls */}
      <Card className="w-auto max-w-[25rem] h-auto grid place-items-center row-start-2 col-start-2 row-end-4 mx-8">
        <CardHeader className="text-center">
          <CardTitle>Access Controls</CardTitle>
          <CardDescription>
            <span>{`Control which users have access to this ${
              note?.isDirectory
                ? "directory, and thus its notes and subdirectories as well (unless manually overridden on a case by case basis)."
                : "note."
            }`}</span>
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter></CardFooter>
      </Card>
      <div className="flex-grow"></div>
      <div className="flex col-start-2 row-start-4">
        <Button className="mr-2 w-[9rem]" onClick={routeHome}>
          <Home size={15} />
          <span className="ml-2">Home</span>
        </Button>
        {note?.isDirectory ? null : (
          <Button className="w-[9rem]" onClick={routeEditor}>
            <FaEdit size={15} />
            <span className="ml-2">Edit note</span>
          </Button>
        )}
        <Button className="ml-2 w-[12rem]" onClick={handleDownloadHtmlPress}>
          <ArrowDownFromLine size={15} />
          <span className="ml-2">Download HTML</span>
        </Button>
      </div>
      <Button
        className="mb-8 mt-8 w-[9rem]"
        variant={"destructive"}
        onClick={deleteButtonPressed}>
        <span className="ml-2">
          Delete {note?.isDirectory ? "directory" : "note"}
        </span>
      </Button>
    </main>
  );
};

export default NoteSettings;
