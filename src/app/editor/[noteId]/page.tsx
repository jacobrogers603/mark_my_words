"use client";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import ComboBox from "@/components/ComboBox";
import { useState, useRef, useEffect, useCallback, use } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios, { AxiosResponse } from "axios";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Home, PencilRuler, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "@/components/NavBar";
import { IoSettingsSharp } from "react-icons/io5";
import SideDrawer from "@/components/SideDrawer";
import BottomDrawer from "@/components/BottomDrawer";
import JSZip from "jszip";

interface FileDetails {
  key: string;
  blob: Blob;
  lastModified: Date;
}

interface User {
  id: string;
  email: string;
  username: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function Editor() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const [isPublicNote, setIsPublicNote] = useState(false);
  let { noteId } = useParams();
  const router = useRouter();
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  const getUser = async () => {
    setFilesLoading(true);
    try {
      const response = await axios.get("/api/getCurrentUsername");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setFilesLoading(false);
    }
  };

  const checkAccess = async () => {
    if (!currentUser) {
      getUser();
      return;
    }
    try {
      if (noteId === "new" || noteId.includes("newPublic")) {
        setHasWriteAccess(true);
        setIsCreator(true);
        if (noteId.includes("newPublic")) {
          setIsPublicNote(true);
        }
        return;
      }

      const { data } = await axios.get(`/api/getAccessLists/${noteId}`);
      const hasAccess = data.writeAccessList.includes(currentUser.email);
      const publicHasAccess = data.readAccessList.includes("public");

      setIsPublicNote(publicHasAccess);
      setHasWriteAccess(hasAccess);

      if (!hasAccess) {
        router.push("/unauthorized");
      }

      const { data: noteUserId } = await axios.get(
        `/api/getNoteUserId/${noteId}`
      );

      const noteCreator = noteUserId === currentUser?.id;

      setIsCreator(noteCreator);
    } catch (error) {
      console.error("Failed to fetch access list", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (noteId && session && currentUser) {
      checkAccess();
    }
  }, [noteId, session, router, currentUser]);

  const [note, setNote] = useState<Note | undefined>(undefined);
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
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [noFilesMessage, setNoFilesMessage] = useState<string>("");
  const [bottomDrawerIsOpen, setBottomDrawerIsOpen] = useState(false);

  const cursorPositionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const fetchNote = async () => {
    try {
      const response = await axios.get(`/api/getNote/${noteId}`);
      setNote(response.data);
    } catch (error) {
      console.error("Failed to fetch note:", error);
    }
  };

  useEffect(() => {
    if (
      !note &&
      hasWriteAccess &&
      noteId !== "new" &&
      !noteId.includes("newPublic")
    ) {
      fetchNote();
    }
  }, [noteId, hasWriteAccess]);

  useEffect(() => {
    if (noteId !== "new" && !noteId.includes("newPublic") && note) {
      setTitle(note.title);
      setNoteText(note.content);
    }
  }, [noteId, note]);

  const [generatedId, setGeneratedId] = useState<string>("");

  const generateId = async () => {
    const response = await axios.post("/api/createNoteId");
    const newId = response.data.id;
    setGeneratedId(newId);
  };

  // If the note is new, generate the ID now
  useEffect(() => {
    if (noteId === "new" || noteId.includes("newPublic")) {
      generateId();
    }
  }, []);

  const fetchAndUnzipMedia = async (): Promise<void> => {
    if (!currentUser) {
      getUser();
    }
    try {
      setFilesLoading(true);
      setNoFilesMessage("Images loading...");
      const response: AxiosResponse<Blob> = await axios.get<Blob>(
        `/api/getMedia/${currentUser?.id}`,
        {
          responseType: "blob",
        }
      );

      handleUnzip(response.data);
    } catch (error) {
      setNoFilesMessage("Failed to load images");
      console.error("Error downloading or unzipping files:", error);
    }
  };

  // Function to unzip files and update state
  const handleUnzip = async (fileBlob: Blob): Promise<void> => {
    const zip = new JSZip();
    try {
      const content = await zip.loadAsync(fileBlob); // Load the zip Blob
      const filesArray: FileDetails[] = [];

      for (const filename of Object.keys(content.files)) {
        const file = content.files[filename];
        if (!file.dir) {
          const blob: Blob = await file.async("blob");
          const dateCreated = extractFileID(filename); // The ID is the original date.now when the file was uploaded
          filesArray.push({
            key: filename,
            blob: blob,
            lastModified: dateCreated,
          });
        }
      }

      setFiles(filesArray); // Update state with the new files
      setFilesLoading(false);
      setNoFilesMessage("No images");
    } catch (error) {
      console.error("Error unzipping the file:", error);
    }
  };

  const extractFileID = (filename: string): Date => {
    const match = filename.match(/-id=(\d+)/);
    return match ? new Date(parseInt(match[1], 10)) : new Date();
  };

  useEffect(() => {
    if (currentUser && hasWriteAccess) {
      fetchAndUnzipMedia();
    }
  }, [currentUser, hasWriteAccess]);

  const routeHome = () => {
    setHomePressed(true);
    if (!isSaved && !isUnsavedDialogOpen) {
      setIsUnsavedDialogOpen(true);
      return;
    }

    if (isPublicNote && currentUser) {
      router.push(`/${currentUser.username}`);
    } else {
      router.push("/");
    }
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
          generatedId: generatedId,
          title: currentTitle,
          content: currentText,
          isDirectory: false,
        });

        if (newlySavedNote && newlySavedNote.status === 200) {
          router.push(`/editor/${generatedId}`);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (noteId.includes("newPublic")) {
      try {
        let prefix = "newPublic";
        let parentId = noteId.slice(prefix.length);

        const newlySavedNote = await axios.post("/api/saveNote", {
          generatedId: generatedId,
          title: currentTitle,
          content: currentText,
          isDirectory: false,
          isPublic: true,
          parentId: parentId,
        });

        if (newlySavedNote && newlySavedNote.status === 200) {
          router.push(`/editor/${generatedId}`);
        }
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
    setIsSaved(true);
    toast({
      description: `Your note: ${currentTitle} has been saved!`,
    });
  }, [noteId, toast, generatedId]);

  const closeDialog = () => setIsDialogOpen(false);
  const closeUnsavedDialog = () => setIsUnsavedDialogOpen(false);
  const closeTemplatesDialog = () => setIsTemplatesDialogOpen(false);

  const handleTextareaChange = () => {
    setIsSaved(false);
  };

  const handleCloseWithoutSavingPress = () => {
    if (homePressed) {
      if(isPublicNote && currentUser){
        router.push(`/${currentUser.username}`);
      }
      else{
        router.push("/");
      }
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
    setNoteText((prev) => prev + "\n" + templateContent);
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

  const toggleBottomDrawer = () => {
    setBottomDrawerIsOpen((prev) => !prev);
  };

  const appendImageLink = (altText: string, link: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const currentText = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const textBefore = currentText.substring(0, start);
    const textAfter = currentText.substring(end);
    const imageLink = `![${altText}](${link})`;

    const newText = textBefore + imageLink + textAfter;
    setNoteText(newText);

    // Set the cursor position after the inserted link
    const newCursorPosition = start + imageLink.length;
    requestAnimationFrame(() => {
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    });

    toggleBottomDrawer();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey &&
        (event.key === "ArrowUp" || event.key === "ArrowDown")
      ) {
        event.preventDefault();
        moveLine(event.key === "ArrowUp" ? "up" : "down");
      }
    }; 

    const textarea = textAreaRef.current;
    textarea?.addEventListener("keydown", handleKeyDown);

    return () => {
      textarea?.removeEventListener("keydown", handleKeyDown);
    };
  }, [noteText]);

  const moveLine = (direction: "up" | "down") => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const text = textarea.value;
    const initialStart = textarea.selectionStart;
    const initialEnd = textarea.selectionEnd;

    const lines = text.split("\n");
    let lineStart = 0;
    let lineEnd = 0;
    let startLine = 0;
    let endLine = 0;

    // Find the start and end line of the selection
    for (let i = 0; i < lines.length; i++) {
      lineEnd = lineStart + lines[i].length;

      if (initialStart >= lineStart && initialStart <= lineEnd + 1) {
        startLine = i;
      }
      if (initialEnd >= lineStart && initialEnd <= lineEnd + 1) {
        endLine = i;
        break;
      }

      lineStart = lineEnd + 1;
    }

    // Prevent moving beyond the boundaries
    if (
      (direction === "up" && startLine === 0) ||
      (direction === "down" && endLine === lines.length - 1)
    ) {
      return;
    }

    // Calculate the position within the line
    const positionWithinLineStart =
      initialStart -
      text.split("\n").slice(0, startLine).join("\n").length -
      (startLine > 0 ? 1 : 0);
    const positionWithinLineEnd =
      initialEnd -
      text.split("\n").slice(0, endLine).join("\n").length -
      (endLine > 0 ? 1 : 0);

    // Swap lines or blocks of lines based on the direction
    if (direction === "up" && startLine > 0) {
      const temp = lines[startLine - 1];
      lines.splice(startLine - 1, 1);
      lines.splice(endLine, 0, temp);
      startLine--;
      endLine--;
    } else if (direction === "down" && endLine < lines.length - 1) {
      const temp = lines[endLine + 1];
      lines.splice(endLine + 1, 1);
      lines.splice(startLine, 0, temp);
      startLine++;
      endLine++;
    }

    const newText = lines.join("\n");
    setNoteText(newText);

    // Calculate the new cursor positions
    const newStartLineStart =
      lines.slice(0, startLine).join("\n").length + (startLine > 0 ? 1 : 0);
    const newEndLineStart =
      lines.slice(0, endLine).join("\n").length + (endLine > 0 ? 1 : 0);
    const newCursorStart = newStartLineStart + positionWithinLineStart;
    const newCursorEnd = newEndLineStart + positionWithinLineEnd;

    // Set the cursor position after the state has updated
    requestAnimationFrame(() => {
      if (initialStart === initialEnd) {
        textarea.setSelectionRange(newCursorStart, newCursorStart); // Set cursor position
      } else {
        textarea.setSelectionRange(newCursorStart, newCursorEnd); // Set selection range
      }
    });

    setIsSaved(false);
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
    <>
      <Toaster />
      <main className="w-full h-screen flex flex-col pt-[5.5rem] bg-blue-100">
        <NavBar
          userProvided={true}
          userProp={currentUser}
          editor={true}
          routeHomeProvided={true}
          routeHome={routeHome}
        />
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
              <BottomDrawer
                lgMode={true}
                files={files}
                filesLoading={filesLoading}
                noFilesMessage={noFilesMessage}
                appendImageLink={appendImageLink}
                currentUserId={currentUser?.id || ""}
                noteId={noteId.toString()}
                handleTextAreaChange={handleTextareaChange}
              />
            ) : null}
            {lgMode ? (
              <div className="grid place-items-center w-fit mr-6">
                <ComboBox lgMode={lgMode} appendTemplate={appendTemplate} />
              </div>
            ) : null}
            {noteId !== "new" && !noteId.includes("newPublic") && lgMode ? (
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
                noteId={`noteId === "new" || noteId.includes("newPublic") ? generatedId : noteId.toString()`}
                title={title}
                setTitle={setTitle}
                handleTextareaChange={handleTextareaChange}
                titleRef={titleRef}
                openTemplatesDialog={openTemplatesDialog}
                isCreator={isCreator}
                files={files}
                filesLoading={filesLoading}
                noFilesMessage={noFilesMessage}
                appendImageLink={appendImageLink}
                currentUserId={currentUser?.id || ""}
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
    </>
  );
}
