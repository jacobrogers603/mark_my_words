"use client";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import ComboBox from "@/components/ComboBox";
import { HiDotsHorizontal } from "react-icons/hi";
import FormattingButton from "@/components/FormattingButton";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { set } from "react-hook-form";
import axios from "axios";
import useNote from "@/hooks/useNote";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Home, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "@/components/NavBar";
import { IoSettingsSharp } from "react-icons/io5";
import { Separator } from "@radix-ui/react-separator";

export default function Editor() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const { noteId } = useParams();
  const { data: note, mutate } = useSWR(`/api/getNote/${noteId}`, fetcher);
  const [noteText, setNoteText] = useState("");
  const [title, setTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(true);
  const [homePressed, setHomePressed] = useState(false);
  const [settingsPressed, setSettingsPressed] = useState(false);
  const [lgMode, setLgMode] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (noteId !== "new" && note) {
      setTitle(note.title);
      setNoteText(note.content);
    }
  }, [noteId, note]);

  const router = useRouter();

  const routeHome = () => {
    setHomePressed(true);
    if (!isSaved && !isUnsavedDialogOpen) {
      setIsUnsavedDialogOpen(true);
      return;
    }

    router.push("/");
  };

  const routeSettings = () => {
    setSettingsPressed(true);
    if (!isSaved && !isUnsavedDialogOpen) {
      setIsUnsavedDialogOpen(true);
      return;
    }

    router.push(`/note/settings/${noteId}`);
  };

  const saveNote = useCallback(async () => {
    const currentText = textAreaRef.current ? textAreaRef.current.value : "";
    const currentTitle = titleRef.current ? titleRef.current.value : "";
    setNoteText(currentText);
    setTitle(currentTitle);

    if (currentTitle === "") {
      setIsDialogOpen(true);
      return;
    }

    if (noteId === "new") {
      try {
        const newlySavedNote = await axios.post("/api/saveNote", {
          title: currentTitle,
          content: currentText,
          isDirectory: false,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await axios.post("/api/saveNote", {
          id: noteId,
          title: currentTitle,
          content: currentText,
          isDirectory: false,
        });
      } catch (error) {
        console.log(error);
      }
    }
    mutate();
    setIsSaved(true);
    toast({
      description: `Your note: ${currentTitle} has been saved!`,
    });
  }, [mutate, noteId, toast]);

  const closeDialog = () => setIsDialogOpen(false);
  const closeUnsavedDialog = () => setIsUnsavedDialogOpen(false);
  const closeSheet = () => setIsSheetOpen(false);

  const handleTextareaChange = () => {
    setIsSaved(false);
  };

  const handleCloseWithoutSavingPress = () => {
    if (homePressed) {
      router.push("/");
    } else if (settingsPressed) {
      router.push(`/note/settings/${noteId}`);
    }
  };

  const handleReturnPress = () => {
    setHomePressed(false);
    setSettingsPressed(false);
    setIsUnsavedDialogOpen(false);
  };

  const appendTemplate = (templateContent: string) => {
    setNoteText((prev) => prev + "\n\n" + templateContent);
    setIsSaved(false);
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setLgMode(window.innerWidth >= 1024); // 1024px as the lg screen size breakpoint
    };

    // Check on mount and add listener for resize events
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Cleanup listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const openSheet = () => setIsSheetOpen(true);

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
    <main className="w-full h-screen grid place-items-center bg-blue-100">
      {/* side sheet */}
      <Sheet open={isSheetOpen}>
        <SheetContent className="flex flex-col">
          <Button className="w-[9rem]" onClick={routeHome}>
            <Home size={15} />
            <span className="ml-2">Home</span>
          </Button>
          <Button
            onClick={saveNote}
            variant={isSaved ? "secondary" : "default"}
            disabled={isSaved}
            className="col-start-2 row-start-2 w-fit justify-self-end">
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button className="w-[9rem]" onClick={routeSettings}>
            <IoSettingsSharp />
            <span className="ml-2">Note settings</span>
          </Button>
        </SheetContent>
      </Sheet>

      <NavBar editor={true} routeHome={routeHome} />
      <div className="absolute top-[40%] right-[40%] z-10">
        {/* No Title Dialog */}
        {isDialogOpen && (
          <Dialog open={isDialogOpen}>
            <DialogContent className="w-auto grid place-items-center">
              <DialogHeader>
                <DialogTitle>Missing Information</DialogTitle>
                <DialogDescription>
                  Your note needs a title before you can save it.
                </DialogDescription>
              </DialogHeader>
              {/* Close button or similar action */}
              <Button className="w-[50%]" onClick={closeDialog}>
                Close
              </Button>
            </DialogContent>
          </Dialog>
        )}
        {/* unsaved dialog */}
        {isUnsavedDialogOpen && (
          <Dialog open={isUnsavedDialogOpen}>
            <DialogContent className="w-auto grid place-items-center">
              <DialogHeader>
                <DialogTitle>Unsaved Changes!</DialogTitle>
                <DialogDescription>
                  Warning, your note has unsaved changes.
                </DialogDescription>
              </DialogHeader>
              <div className="flex">
                <Button className="mr-6" onClick={handleReturnPress}>
                  Return
                </Button>
                <Button onClick={handleCloseWithoutSavingPress}>
                  Close w/o saving
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Note saved toast */}
        <Toaster />
      </div>
      <div className="relative border-solid border-black border-2 rounded-md w-[80%] h-[80%] bg-white">
        <nav className="absolute top-0 right-0 left-0 h-32 lg:h-16 grid grid-cols-2 grid-rows-2 border-b-2 border-b-black pl-4 pr-4 z-2 place-items-center">
          <div className="flex flex-col text-center self-start justify-self-start">
            <h1 className="font-bold text-lg text-start md:text-center">
              Note Editor
            </h1>
            <p className="text-gray-500 text-start md:text-center">
              Markdown Format
            </p>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              handleTextareaChange();
            }}
            ref={titleRef}
            className="border-solid border-2 border-black rounded-lg w-full p-2 col-start-2 row-start-1"
          />
          {lgMode ? (
            <Button className="mr-2 w-[9rem]" onClick={routeHome}>
              <Home size={15} />
              <span className="ml-2">Home</span>
            </Button>
          ) : null}
          {noteId !== "new" && lgMode ? (
            <Button className="w-[9rem]" onClick={routeSettings}>
              <IoSettingsSharp />
              <span className="ml-2">Note settings</span>
            </Button>
          ) : null}
          {!lgMode ? (
            <Button
              className="row-start-2 col-start-1 w-fit bg-gray-400 justify-self-start"
              onClick={openSheet}>
              ...
            </Button>
          ) : null}
          <div className="col-start-1 col-end-3 ml-4">
            <ComboBox appendTemplate={appendTemplate} />
          </div>
        </nav>
        <div className="w-full h-full pt-32 lg:pt-16">
          <textarea
            className="focus:outline-none focus:shadow-none h-full w-full resize-none p-2 rounded-b-md"
            placeholder=" Start writing..."
            ref={textAreaRef}
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value);
              handleTextareaChange();
            }}></textarea>
        </div>
      </div>
    </main>
  );
}

{
  /* <div className="p-4 flex flex-col col-start-5 h-full border-l-2 border-l-black text-center">
            <h2 className="font-extrabold">Markdown Cheat Sheet</h2>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <ul>
              <li>
                <span className="font-bold italic"># Text</span> Heading
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">## Text</span> Sub Heading
                (max 6)
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">*Text*</span> Italic
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">**Text**</span> Bold
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">~~Text~~</span> Strikethrough
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">- List Item</span> Bulleted
                List
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">1. List Item</span> Numeric
                List
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">`Code`</span> Code Block
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">---</span> Horizontal Line
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">[Link Text](URL)</span> Link
              </li>
              <Separator
                className="h-[2px] bg-gray-800 my-2"
                orientation="horizontal"
              />
              <li>
                <span className="font-bold italic">
                  ![Alt Text](Image Path)
                </span>{" "}
                Image
              </li>
            </ul>
          </div> */
}
