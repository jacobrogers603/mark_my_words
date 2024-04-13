import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { NotebookText, FolderClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowDownFromLine, ArrowUpToLine } from "lucide-react";

interface DirectoryItemsProps {
  currentDirNotes: JsonObject[] | null;
  currentPath: string[] | null;
  updateCurrentPath: (directoryId?: string) => Promise<void>;
}

export const DirectoryItems: React.FC<DirectoryItemsProps> = ({
  currentDirNotes,
  currentPath,
  updateCurrentPath,
}) => {
  const router = useRouter();
  const [notes, setNotes] = useState<JsonObject[]>([]);
  const [pathTitles, setPathTitles] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get("/api/getCurrentDirectoryNotes");
        setNotes(response.data);
      } catch (error) {
        console.log("Failed to fetch notes", error);
      }
    };

    fetchNotes();
  }, [currentPath]);

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
    router.push("/editor/new");
  };

  const [directoryTitle, setDirectoryTitle] = useState("");
  const createDirectory = useCallback(async () => {
    try {
      await axios.post("/api/saveNote", {
        title: directoryTitle,
        content: "",
        isDirectory: true,
      });

      // Fetch the updated list of notes in the current directory
      const response = await axios.get("/api/getCurrentDirectoryNotes");
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
  const dirNotes = notes.filter((note) => note.isDirectory == true);
  const nonDirNotes = notes.filter((note) => note.isDirectory == false);

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
        className="font-bold m-8 p-2 border-solid border-gray-600 text-gray-600 border-2 rounded-md overflow-auto whitespace-nowrap">
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

  const handleUploadClick = async () => {};

  return (
    <main className="w-[80%] md:w-[65%] lg:w-[50%]">
      <AutoScrollH2 path={path} />
      <div className="w-full h-8 flex mb-8">
        <div className="pl-8 flex items-center justify-start">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
              <FiPlusCircle size={30} />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col md:flex-row lg:flex-row md:space-x-4 lg:space-x-4">
                <div onClick={createNote}>
                  <Button className="mb-4 md:mb-0 lg:mb-0 ">
                    <NotebookText className="mr-2 h-4 w-4" /> Create a new note
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
        <div className="flex-grow"></div>
        <ArrowUpToLine 
          onClick={handleUploadClick}
          className="ml-4 h-full w-fit hover:cursor-pointer" 
          size={30}  />
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
        />
      ))}

      {/* Render non-directory notes */}
      {nonDirNotes.map((note) => (
        <DirectoryItem
          key={note.id?.toString()}
          note={note ?? null}
          updateCurrentPath={updateCurrentPath}
        />
      ))}
    </main>
  );
};

export default DirectoryItems;
