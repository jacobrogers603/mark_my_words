"use client";
import NavBar from "@/components/NavBar";
import useNote from "@/hooks/useNote";
import axios, { AxiosResponse, all } from "axios";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import React, { use, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowDownFromLine, ArrowLeft, Home, Link, PencilRuler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaEdit } from "react-icons/fa";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import UserItem from "@/components/userItem";
import { FiPlusCircle } from "react-icons/fi";
import { Switch } from "@radix-ui/react-switch";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { set } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { forEach } from "jszip";
import DirectoryLocation from "@/components/DirectoryLocation";

interface User {
  id: string;
  email: string;
  username: string;
}

interface Note {
  id: string;
  title: string;
  htmlContent: string;
  isDirectory: boolean;
  parentId: string;
}

interface Directory {
  id: string;
  title: string;
}

interface NoteItem {
  title: string;
  id: string;
  isDirectory: boolean;
}

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
  const [note, setNote] = useState<Note | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: noteUserId } = await axios.get(
          `/api/getNoteUserId/${noteId}`
        );
        const currentUser = await axios.get("/api/getCurrentUsername");

        const noteCreator = noteUserId === currentUser.data?.id;

        setIsCreator(noteCreator);
        setUser(currentUser.data);
        if (!noteCreator) {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error(
          "Failed to check if current user is creator of note",
          error
        );
      }
    };

    if (noteId && session) {
      checkAccess();
    }
  }, [noteId, session, router]);

  const fetchNote = async () => {
    try {
      const response = await axios.get(`/api/getNote/${noteId}`);
      setNote(response.data);
    } catch (error) {
      console.error("Failed to fetch note:", error);
    }
  };

  useEffect(() => {
    if (isCreator && noteId) {
      fetchNote();
    }
  }, [isCreator, noteId]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [writeAccessUsers, setWriteAccessUsers] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [writeAccess, setWriteAccess] = useState(false);
  const { toast } = useToast();
  const [subDirectories, setSubDirectories] = useState<Directory[]>([]);
  const [parentDirectory, setParentDirectory] = useState<Directory | undefined>(
    undefined
  );
  const [currentDirectory, setCurrentDirectory] = useState<
    Directory | undefined
  >(undefined);
  const [currentDirectoryParent, setCurrentDirectoryParent] = useState<
    Directory | undefined
  >(undefined);

  const closeDialog = () => setIsDialogOpen(false);
  const closeAddUserDialog = () => setIsAddUserDialogOpen(false);

  const fetchParentDirectory = async (parentId: string) => {
    try {
      const response = await axios.get(`/api/getNote/${parentId}`);
      setParentDirectory({ id: response.data.id, title: response.data.title });

      // First time we fetch the parent directory, set the current directory as well
      if (!currentDirectory) {
        setCurrentDirectory({
          id: response.data.id,
          title: response.data.title,
        });
      }
    } catch (error) {
      console.error("Failed to fetch parent directory:", error);
    }
  };

  const fetchSubDirectories = async () => {
    try {
      const response = await axios.get(
        `/api/getPublicCurDirNotes/${currentDirectory?.id}`
      );

      let subDirs: Directory[] = [];

      response.data.forEach((noteItem: NoteItem) => {
        if (noteItem.isDirectory) {
          subDirs.push({ id: noteItem.id, title: noteItem.title });
        }
      });
      setSubDirectories(subDirs);
    } catch (error) {
      console.error("Failed to fetch subdirectories:", error);
    }
  };

  const fetchCurrentDirectoryParent = async () => {
    try {
      const response = await axios.get(
        `/api/getNoteParentId/${currentDirectory?.id}`
      );

      if (!response.data) {
        return;
      }

      const parentResponse = await axios.get(
        `/api/getNoteTitleAndId/${response.data}`
      );
      setCurrentDirectoryParent(parentResponse.data);
    } catch (error) {
      console.error("Failed to fetch current directory parent:", error);
    }
  };

  // Changing the current directory for the location UI
  const changeCurrentDirectory = async (id: string, title: string) => {
    setCurrentDirectory({ id: id, title: title });
  };

  const goUpADirectory = () => {
    if (!currentDirectoryParent || !currentDirectoryParent.id) {
      return;
    }
    changeCurrentDirectory(
      currentDirectoryParent.id,
      currentDirectoryParent.title
    );
  };

  useEffect(() => {
    if (note) {
      fetchParentDirectory(note.parentId);
    }
  }, [note]);

  useEffect(() => {
    if (currentDirectory) {
      fetchSubDirectories();
      fetchCurrentDirectoryParent();
    }
  }, [currentDirectory]);

  // Change the parent directory of the current note, which will move the note in the hierarchy
  const changeParentDirectory = async (id?: string) => {
    if (!id) {
      return;
    }

    try {
      // Check if the new parent is public
      let publicDir = false;
      const publicResponse = await axios.get(`/api/getAccessLists/${id}`);
      if (
        publicResponse.data &&
        publicResponse.data.readAccessList.includes("public")
      ) {
        publicDir = true;
      }

      // update the parentIds to move the note in the hierarchy
      const response = await axios.post(`/api/changeParentDir/${noteId}/${id}`);

      // update the access list to be public, or not, depending on the new parent, if it is a directory, do it recursively
      const accessResponse = await changeAccess(publicDir, noteId);

      if (
        response.data.success === true &&
        accessResponse === true
      ) {
        fetchParentDirectory(id);
        fetchNote();
      }
    } catch (error) {
      console.error("Failed to change parent directory:", error);
    }
  };

  const changeAccess = async (publicAccess: boolean, noteId: string | string[]) => {
    try {
      const childrenIdsResponse = await axios.get(
        `/api/getChildrenIds/${noteId}`
      );

      for (let i = 0; i < childrenIdsResponse.data.length; i++) {
        await changeAccess(publicAccess, childrenIdsResponse.data[i]);
      }

      if (publicAccess) {
        await axios.post(`/api/forceNotePublic/${noteId}`);
      } else {
        await axios.post(`/api/forceNotePrivate/${noteId}`);
      }
      return true;
    } catch (error) {
      console.error("Failed to change access:", error);
      return false;
    }
  };

  const deleteButtonPressed = () => {
    setIsDialogOpen(true);
  };

  const routeHome = () => {
    if (!user || !allowedUsers) {
      router.push("/");
    }
    if (user && allowedUsers.includes("public")) {
      router.push(`/${user.username}`);
    } else {
      router.push("/");
    }
  };

  const routeBack = () => {
    router.back();
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

  const handleAddUserPress = () => {
    setIsAddUserDialogOpen(true);
  };

  const addUser = async () => {
    try {
      await axios.post("/api/addToAccessList", {
        noteId: noteId,
        allowedEmail: userEmail,
        writeMode: writeAccess,
      });
      setIsAddUserDialogOpen(false);
      setUserEmail("");
      setWriteAccess(false);
      fetchAllowedUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const checkWriteAccess = (email: string) => {
    return writeAccessUsers?.includes(email);
  };

  const handleUserEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserEmail(event.target.value);
  };

  const handleWriteAccessChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setWriteAccess(event.target.checked);
  };

  const handleDownloadHtmlPress = async () => {
    if (note?.isDirectory) {
      try {
        const response: AxiosResponse<Blob> = await axios.post<Blob>(
          "/api/downloadDirectory",
          {
            id: note.id,
            htmlMode: true,
          },
          {
            responseType: "blob",
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${note.title}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download directory", error);
      }
    } else {
      try {
        const content = note?.htmlContent;
        if (!content) {
          console.error("No content to download");
          return;
        }
        const blob: Blob = new Blob([content], {
          type: "text/html;charset=utf-8",
        });
        const url: string = URL.createObjectURL(blob);
        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.href = url;
        anchor.download = `${note?.title}.html`;

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download note", error);
      }
    }
  };

  const fetchAllowedUsers = useCallback(async () => {
    try {
      const responseBundle = await axios.get(`/api/getAccessLists/${noteId}`);

      setAllowedUsers(responseBundle.data.readAccessList);
      setWriteAccessUsers(responseBundle.data.writeAccessList);
    } catch (error) {
      console.log("Failed to fetch access lists:", error);
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId) {
      fetchAllowedUsers();
    }
  }, [noteId, fetchAllowedUsers]);

  const toggleWriteMode = async (email: string, writeAccess: boolean) => {
    if (writeAccess) {
      try {
        await axios.delete(`/api/removeWriteAccess`, {
          data: {
            noteId: noteId,
            allowedEmail: email,
          },
        });
      } catch (error) {
        console.log("Failed to remove write access:", error);
      }
    } else {
      try {
        await axios.post(`/api/giveWriteAccess`, {
          noteId: noteId,
          allowedEmail: email,
        });
      } catch (error) {
        console.log("Failed to give write access:", error);
      }
    }
    fetchAllowedUsers();
  };

  const removeUsersAccess = async (email: string) => {
    try {
      await axios.delete(`/api/removeFromAccessList`, {
        data: {
          noteId: noteId,
          targetEmail: email,
        },
      });
      fetchAllowedUsers();
    } catch (error) {
      console.log("Failed to remove user's access:", error);
    }
  };

  const linkButtonClicked = () => {
    const currentLink = window.location.href;
    const noteLink = currentLink.replace("/settings", "");

    navigator.clipboard.writeText(noteLink);

    toast({
      description: "Share link copied to clipboard",
    });
  };

  if (status === "loading" || !isCreator || !note) {
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
      <main
        className={`flex flex-col justify-start items-center w-full min-h-screen ${
          note?.isDirectory ? "bg-amber-100" : "bg-blue-100"
        }`}>
        <NavBar
          routeHomeProvided={true}
          routeHome={routeHome}
          userProvided={true}
          userProp={user}
        />
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

        {/* Add user dialog */}
        {isAddUserDialogOpen && (
          <Dialog open={isAddUserDialogOpen}>
            <DialogContent className="w-auto grid place-items-center text-center grid-rows-4 max-w-[18rem] rounded-md">
              <DialogHeader className="text-center row-start-1">
                <DialogTitle className="text-center">
                  Grant a User Access
                </DialogTitle>
                <DialogDescription className="text-center">
                  {`Enter the email of the user you want to grant access to this ${
                    note?.isDirectory ? "directory." : "note."
                  }.`}
                </DialogDescription>
              </DialogHeader>
              <Input
                className="row-start-2 w-auto"
                id="email"
                placeholder="Email"
                value={userEmail}
                onChange={handleUserEmailChange}
              />
              <div className="flex justify-start items-center">
                <label className="text-gray-600 mr-4" htmlFor="writeAccess">
                  Write Access:
                </label>
                <Input
                  type="checkbox"
                  id="writeAccess"
                  name="writeAccess"
                  checked={writeAccess}
                  onChange={handleWriteAccessChange}
                />
              </div>
              <div className="flex row-start-4 justify-around">
                <Button className="w-[50%]" onClick={closeAddUserDialog}>
                  Cancel
                </Button>
                <Button className="ml-2 w-[50%]" onClick={addUser}>
                  Add User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* page title */}
        <div className="flex flex-col mx-8 max-w-[80%] md:max-w-[60%]mb-4">
          <h1 className="mt-16 mb-4 font-medium text-xl md:text-3xl text-black text-center">
            {note?.isDirectory ? "Directory" : "Note"}&nbsp;Settings:
          </h1>

          <div className="mb-4 overflow-x-auto">
            <span className="text-gray-600 italic text-xl md:text-3xl whitespace-nowrap text-start">
              {note?.title}
            </span>
          </div>
        </div>

        {/* Home & Edit button */}
        <div className="flex w-full md:w-[60%] items-center justify-center">
          <Button className="mr-2 w-[9rem]" onClick={routeBack}>
            <ArrowLeft size={15} />
            <span className="ml-2">Back</span>
          </Button>
          {note?.isDirectory ? null : (
            <Button className="w-[9rem]" onClick={routeEditor}>
              <FaEdit size={15} />
              <span className="ml-2">Edit note</span>
            </Button>
          )}
        </div>

        <Accordion
          className="mt-6 w-full md:w-[60%] p-4 rounded-md shadow-md bg-white"
          type="single"
          collapsible>
          {!note.isDirectory ? (
            <AccordionItem value="item-1">
              <AccordionTrigger>Access Controls & Sharing</AccordionTrigger>
              <AccordionContent className="flex flex-col w-full items-center text-center p-2">
                {/* Access controls */}
                {note?.isDirectory ? null : (
                  <Card className="w-auto max-w-[25rem] flex-grow flex flex-col justify-start items-center mx-8">
                    <CardHeader className="text-center self-start">
                      <CardDescription>
                        <span>{`Control which users have access to this ${
                          note?.isDirectory
                            ? "directory, and thus its notes and subdirectories as well (unless manually overridden on a case by case basis)."
                            : "note."
                        }`}</span>
                      </CardDescription>
                      <div className="flex">
                        <FiPlusCircle
                          size={30}
                          onClick={handleAddUserPress}
                          className="cursor-pointer">
                          Add User
                        </FiPlusCircle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Link
                                className="ml-4"
                                onClick={linkButtonClicked}
                                size={25}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy share link</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea
                        className="h-fit min-h-8 max-h-24 w-48 rounded-md border overflow-y-auto p-2"
                        type="scroll">
                        {allowedUsers
                          .filter(
                            (user, index) => index !== 0 && user !== "public"
                          )
                          .map((user, index) => (
                            <UserItem
                              key={index}
                              email={user}
                              writeAccess={checkWriteAccess(user)}
                              toggleWriteMode={toggleWriteMode}
                              removeUsersAccess={removeUsersAccess}
                            />
                          ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </AccordionContent>
            </AccordionItem>
          ) : null}
          <AccordionItem value="item-2">
            <AccordionTrigger>Location</AccordionTrigger>
            <AccordionContent className="flex flex-col w-full items-center text-center p-2">
              <div className="overflow-y-auto flex-grow pt-2 flex flex-col w-full justify-center items-center">
                {/* current dir */}
                <div className="flex flex-col w-full items-center">
                  <div
                    className={`w-[90%] md:w-[70%] h-10 grid grid-cols-2 place-items-center ${
                      currentDirectory?.id === note.parentId
                        ? "bg-green-200"
                        : "bg-gray-200"
                    } border-solid border-2 border-black rounded-md mb-4 p-2 overflow-auto`}>
                    <span className="cursor-default">
                      {currentDirectory?.title}
                    </span>
                    <Button
                      variant={"link"}
                      disabled={
                        currentDirectory?.id === note.parentId ? true : false
                      }
                      className="h-5"
                      onClick={() =>
                        changeParentDirectory(currentDirectory?.id)
                      }>
                      {currentDirectory?.id === note.parentId
                        ? "Current Location"
                        : "Set Location"}
                    </Button>
                  </div>
                </div>
                {/* up dir */}
                {currentDirectory?.title !== user?.email ? (
                  <div
                    className="w-[80%] md:w-[60%] h-10 grid place-items-center bg-blue-300 hover:bg-blue-400 cursor-pointer border-solid border-2 border-black rounded-md mb-2 p-2 overflow-auto"
                    onClick={goUpADirectory}>
                    ↑ . . .
                  </div>
                ) : null}
                {/* sub dirs */}
                {subDirectories
                  .filter((subDir: Directory) => subDir.title !== note.title)
                  .map((subDir: Directory) => (
                    <DirectoryLocation
                      key={subDir.id}
                      title={subDir.title}
                      id={subDir.id}
                      changeCurrentDirectory={changeCurrentDirectory}
                    />
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Delete & Other Options</AccordionTrigger>
            <AccordionContent className="grid place-items-center p-2">
              <Button
                className="ml-2 w-[12rem]"
                onClick={handleDownloadHtmlPress}>
                <ArrowDownFromLine size={15} />
                <span className="ml-2">Download HTML</span>
              </Button>
              {note?.isDirectory ? null : (
                <Button
                  className="mb-8 mt-8 w-[9rem]"
                  variant={"destructive"}
                  onClick={deleteButtonPressed}>
                  <span className="ml-2">
                    Delete {note?.isDirectory ? "directory" : "note"}
                  </span>
                </Button>
              )}
              {note?.isDirectory ? (
                <Button
                  className="mb-8 mt-8 w-[9rem]"
                  variant={"destructive"}
                  onClick={deleteButtonPressed}>
                  <span className="ml-2">
                    Delete {note?.isDirectory ? "directory" : "note"}
                  </span>
                </Button>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex-grow"></div>
      </main>
    </>
  );
};

export default NoteSettings;
