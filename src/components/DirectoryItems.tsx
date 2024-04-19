import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DirectoryItem from "./DirectoryItem";
import { JsonObject } from "@prisma/client/runtime/library";
import axios, { AxiosResponse } from "axios";
import { FaFolderClosed } from "react-icons/fa6";
import { FiPlusCircle } from "react-icons/fi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { NotebookText, FolderClosed, Link } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowDownFromLine, ArrowUpToLine } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useToast } from "./ui/use-toast";
import { Toaster } from "./ui/toaster";
import { GiRamProfile } from "react-icons/gi";

interface DirectoryItemsProps {
  currentDirNotes: JsonObject[] | null;
  currentPath: string[] | null;
  updateCurrentPath: (directoryId?: string) => Promise<void>;
  isPublic: boolean;
  status: string;
}

export const DirectoryItems: React.FC<DirectoryItemsProps> = ({
  currentDirNotes,
  currentPath,
  updateCurrentPath,
  isPublic,
  status,
}) => {
  const router = useRouter();
  const [notes, setNotes] = useState<JsonObject[]>([]);
  const [pathTitles, setPathTitles] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      if (!currentPath || currentPath.length === 0) {
        return;
      }
      const endpoint = isPublic
        ? `/api/getPublicCurDirNotes/${currentPath[currentPath.length - 1]}`
        : "/api/getCurrentDirectoryNotes";
      const response = await axios.get(endpoint);
      setNotes(response.data);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentPath, isPublic]); // useEffect just to trigger fetchNotes on dependency changes

  useEffect(() => {
    const fetchPathTitles = async () => {
      if (currentPath) {
        const titles = await Promise.all(
          currentPath.map(async (directoryId) => {
            try {
              const response = await axios.get(`/api/getNote/${directoryId}`);
              return response.data.title || "";
            } catch (error) {
              console.error("Failed to fetch note:", error);
              return "";
            }
          })
        );

        setPathTitles(titles);
      }
    };

    fetchPathTitles();
  }, [currentPath]);

  const formatPath = (titles: string[]) => {
    if (titles.length === 0) {
      return "";
    }

    const formattedTitles = titles.map((title, index) => {
      if (index === 0) {
        return `${title}:/ `;
      }
      return title;
    });

    return formattedTitles[0] + formattedTitles.slice(1).join(" / ");
  };

  const createNote = () => {
    if (isPublic) {
      if (!currentPath) {
        console.log("current path is null, cannot make new note.");
        return;
      }
      router.push(`/editor/newPublic${currentPath[currentPath.length - 1]}`);
    } else {
      router.push("/editor/new");
    }
  };

  const [directoryTitle, setDirectoryTitle] = useState("");
  const createDirectory = useCallback(async () => {
    try {      
      if (isPublic) {
        if (!currentPath) {
          console.log("current path is null, cannot make new note.");
          return;
        }
        await axios.post("/api/saveNote", {
          title: directoryTitle,
          content: "",
          isDirectory: true,
          isPublic: true,
          parentId: currentPath[currentPath.length - 1],
        });
      } else {
        await axios.post("/api/saveNote", {
          title: directoryTitle,
          content: "",
          isDirectory: true,
        });
      }

      // Fetch the updated list of notes in the current directory
      if (!currentPath || currentPath.length === 0) {
        return;
      }
      const endpoint = isPublic
        ? `/api/getPublicCurDirNotes/${currentPath[currentPath.length - 1]}`
        : "/api/getCurrentDirectoryNotes";
      const response = await axios.get(endpoint);
      setNotes(response.data);
    } catch (error) {
      console.log(error);
    }
    setDirectoryTitle("");
    setPopoverOpen(false);
  }, [directoryTitle]);

  const handleDirectoryTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDirectoryTitle(event.target.value);
  };

  const path = formatPath(pathTitles);

  // Separate directories and notes
  const dirNotes = notes?.filter((note) => note.isDirectory == true);
  const nonDirNotes = notes?.filter((note) => note.isDirectory == false);

  interface AutoScrollH2Props {
    path: string;
  }

  const endRef = useRef<HTMLHeadingElement>(null);

  const AutoScrollH2: React.FC<AutoScrollH2Props> = ({ path }) => {
    const endRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
      if (endRef.current) {
        endRef.current.scrollLeft = endRef.current.scrollWidth;
      }
    }, [path]);

    return (
      <h2
        ref={endRef}
        className="font-bold m-8 p-2 border-solid border-gray-600 text-gray-600 border-2 rounded-md overflow-auto whitespace-nowrap w-full">
        {path}
      </h2>
    );
  };

  const handleDownloadClick = async () => {
    if (!currentPath) {
      console.error("No current path found.");
      return;
    }

    const parentNoteId = currentPath[currentPath.length - 1];
    try {
      const response: AxiosResponse<Blob> = await axios.post<Blob>(
        "/api/downloadDirectory",
        {
          id: parentNoteId,
          htmlMode: false,
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${pathTitles[pathTitles.length - 1]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download directory.", error);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = async () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = event.target.files;

      if (
        fileList[0].name.endsWith(".md") &&
        (fileList[0].type === "text/markdown" || fileList[0].type === "")
      ) {
        await createNoteFromUpload(fileList[0]);
      }
    }
  };

  const createNoteFromUpload = async (file: File) => {
    try {
      const content = await file.text();
      const title = file.name.slice(0, -3);
      if (isPublic) {
        if (!currentPath) {
          console.log("current path is null, cannot make new note.");
          return;
        }
        await axios.post("/api/saveNote", {
          title: title,
          content: "",
          isDirectory: false,
          isPublic: true,
          parentId: currentPath[currentPath.length - 1],
        });
      } else {
        await axios.post("/api/saveNote", {
          title: title,
          content: content,
          isDirectory: false,
        });
      }
      fetchNotes(); // Refresh the notes list after upload
    } catch (error) {
      console.error("Failed to upload note:", error);
    }
  };

  const linkButtonClicked = () => {
    navigator.clipboard.writeText(window.location.href);

    toast({
      description: "Share link copied to clipboard",
    });
  };

  return (
    <main className="w-[80%] md:w-[65%] lg:w-[50%]">
      <Toaster />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={false}
        accept=".md" // Accept only Markdown files
        className="hidden"
      />
      {/* Profile Photo Component to do */}
      <div className="flex h-fit w-full items-center justify-center">
        {isPublic ? (
          <GiRamProfile
            className=" bg-blue-400 rounded-full p-1 border-solid border-black border-2"
            size={40}
          />
        ) : null}
        <AutoScrollH2 path={path} />
      </div>
      <div className="w-full h-8 flex mb-8">
        {status === "authenticated" ? (
          <div className="pl-8 flex items-center justify-start">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger>
                <FiPlusCircle size={30} />
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col md:flex-row lg:flex-row md:space-x-4 lg:space-x-4">
                  <div onClick={createNote}>
                    <Button className="mb-4 md:mb-0 lg:mb-0 ">
                      <NotebookText className="mr-2 h-4 w-4" /> Create a new
                      note
                    </Button>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <FolderClosed className="mr-2 h-4 w-4" /> Create a new
                        directory
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="grid grid-rows-3 grid-cols-2 place-items-center w-[21rem] rounded-md">
                      <DialogHeader className="row-start-1 col-span-2">
                        <DialogTitle className="grid grid-cols-6 place-items-center">
                          <FolderClosed className="" />
                          <span className="col-start-2 col-end-6">
                            Create a new directory
                          </span>
                        </DialogTitle>
                      </DialogHeader>
                      <Input
                        id="title"
                        placeholder="Title"
                        value={directoryTitle}
                        onChange={handleDirectoryTitleChange}
                        className="row-start-2 col-span-2 w-[80%]"
                      />
                      <DialogClose asChild>
                        <Button
                          className="mt-4 row-start-3 col-span-2"
                          type="submit"
                          onClick={createDirectory}>
                          Create
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link className="ml-4" onClick={linkButtonClicked} size={25} />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-100 p-[1px] border-solid border-2 border-gray-400 rounded-md">
              <p>Copy share link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex-grow"></div>
        {status === "authenticated" ? (
          <ArrowUpToLine
            onClick={handleUploadClick}
            className="ml-4 h-full w-fit hover:cursor-pointer"
            size={30}
          />
        ) : null}
        <ArrowDownFromLine
          className="ml-4 h-full w-fit hover:cursor-pointer"
          onClick={handleDownloadClick}
          size={30}
        />
      </div>
      {currentPath && currentPath.length > 1 ? (
        <div
          className="grid place-items-center grid-cols-8 w-full h-10 border-solid rounded-md border-2 bg-blue-400 border-black cursor-pointer mb-2 font-extrabold"
          onClick={() => updateCurrentPath()}>
          <FolderClosed />
          <span className="col-start-2 col-end-5">↑ . . .</span>
        </div>
      ) : null}

      {/* Render directories first */}
      {dirNotes.map((note) => (
        <DirectoryItem
          key={note.id?.toString()}
          note={note ?? null}
          updateCurrentPath={updateCurrentPath}
          status={status}
        />
      ))}

      {/* Render non-directory notes */}
      {nonDirNotes.map((note) => (
        <DirectoryItem
          key={note.id?.toString()}
          note={note ?? null}
          updateCurrentPath={updateCurrentPath}
          status={status}
        />
      ))}
    </main>
  );
};

export default DirectoryItems;
