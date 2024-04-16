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
import { set } from "react-hook-form";
import axios from "axios";
import useNote from "@/hooks/useNote";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Home, PencilRuler, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "@/components/NavBar";
import { IoSettingsSharp } from "react-icons/io5";
import { Separator } from "@radix-ui/react-separator";
import SideDrawer from "@/components/SideDrawer";

export default function Editor() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const { noteId } = useParams();
  const router = useRouter();
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (noteId === "new") {
          setHasWriteAccess(true);
          setIsCreator(true);
          return;
        }

        const { data } = await axios.get(`/api/getAccessLists/${noteId}`);
        const hasAccess = data.writeAccessList.includes(session?.user?.email);
        setHasWriteAccess(hasAccess);
        if (!hasAccess) {
          router.push("/unauthorized");
        }

        const { data: noteUserId } = await axios.get(
          `/api/getNoteUserId/${noteId}`
        );
        const currentUser = await axios.get("/api/current");

        const noteCreator = noteUserId === currentUser.data?.id;

        setIsCreator(noteCreator);
      } catch (error) {
        console.error("Failed to fetch access list", error);
      }
    };

    if (noteId && session) {
      checkAccess();
    }
  }, [noteId, session]);

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
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);

  useEffect(() => {
    if (noteId !== "new" && note) {
      setTitle(note.title);
      setNoteText(note.content);
    }
  }, [noteId, note]);

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
  const closeTemplatesDialog = () => setIsTemplatesDialogOpen(false);

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
    setIsTemplatesDialogOpen(false);
  };

  const appendTemplate = (templateContent: string) => {
    setNoteText((prev) => prev + "\n\n" + templateContent);
    setIsSaved(false);
    setIsTemplatesDialogOpen(false);
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

  const openTemplatesDialog = () => {
    setIsTemplatesDialogOpen(true);
  };

  if (status === "loading" || !hasWriteAccess) {
    return (
      <main className="w-full h-screen grid place-items-center pt-14">
        <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
          <PencilRuler
            onClick={routeHome}
            size={30}
            className="col-start-1 hover:cursor-pointer"
          />
        </nav>
        <div className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen flex flex-col pt-[5.5rem] bg-blue-100">
      <NavBar editor={true} routeHome={routeHome} />
      <div className="">
        {/* No Title Dialog */}
        {isDialogOpen && (
          <Dialog open={isDialogOpen}>
            <DialogContent className="w-auto min-w-[18.75rem] grid place-items-center rounded-md">
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
            <DialogContent className="w-auto grid place-items-center rounded-md">
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
        {/* templates dialog */}
        {isTemplatesDialogOpen && (
          <Dialog open={isTemplatesDialogOpen}>
            <DialogContent className="w-auto grid place-items-center rounded-md">
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
                <DialogDescription>
                  Select a template to append to your note.
                </DialogDescription>
              </DialogHeader>
              <div className="flex">
                <div className="grid place-items-center w-fit mr-6">
                  <ComboBox lgMode={lgMode} appendTemplate={appendTemplate} />
                </div>
                <Button className="mr-6" onClick={handleReturnPress}>
                  Return
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Note saved toast */}
        {lgMode ? <Toaster /> : null}
      </div>
      <div className="relative border-solid border-black border-2 rounded-md w-[80%] flex-grow self-center mb-[2.5rem] bg-white">
        <nav className="absolute top-0 right-0 left-0 h-16 flex border-b-2 border-b-black pl-4 pr-4 z-2 items-center justify-items-center">
          <div className="flex flex-col text-start justify-self-start mr-6 w-fit whitespace-nowrap">
            <h1 className="font-bold">Note Editor</h1>
            <p className="text-gray-500 w-fit">Markdown Format</p>
          </div>
          {lgMode ? (
            <Button className="w-fit mr-6" onClick={routeHome}>
              <Home size={15} />
              <span className="ml-2">Home</span>
            </Button>
          ) : null}
          <div className="flex-grow"></div>
          {lgMode ? (
            <div className="flex flex-col mr-6">
              <label htmlFor="title" className="font-bold">
                Title
              </label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleTextareaChange();
                }}
                ref={titleRef}
                className="border-solid border-2 border-gray-600 rounded-lg w-full"
              />
            </div>
          ) : null}
          {lgMode ? (
            <div className="grid place-items-center w-fit mr-6">
              <ComboBox lgMode={lgMode} appendTemplate={appendTemplate} />
            </div>
          ) : null}
          {noteId !== "new" && lgMode ? (
            <Button
              disabled={!isCreator}
              className={`w-fit mr-6 ${
                isCreator ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={routeSettings}>
              <IoSettingsSharp />
              <span className="ml-2">Settings</span>
            </Button>
          ) : null}
          {lgMode ? (
            <Button
              onClick={saveNote}
              variant={isSaved ? "secondary" : "default"}
              disabled={isSaved}
              className={`w-fit mr-6 ${
                isSaved
                  ? "border-solid border-gray-600 border-2 rounded-md"
                  : ""
              }`}>
              {isSaved ? "Saved" : "Save"}
            </Button>
          ) : null}
          <div className="w-fit mr-4">
            <SideDrawer
              lgMode={lgMode}
              appendTemplate={appendTemplate}
              isSaved={isSaved}
              routeHome={routeHome}
              routeSettings={routeSettings}
              saveNote={saveNote}
              noteId={noteId.toString()}
              title={title}
              setTitle={setTitle}
              handleTextareaChange={handleTextareaChange}
              titleRef={titleRef}
              openTemplatesDialog={openTemplatesDialog}
              isCreator={isCreator}
            />
          </div>
        </nav>
        <div className="w-full h-full pt-16">
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
