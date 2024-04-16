"use client";
import NavBar from "@/components/NavBar";
import useNote from "@/hooks/useNote";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import { ScrollArea } from "@radix-ui/react-scroll-area";
import UserItem from "@/components/userItem";
import { FiPlusCircle } from "react-icons/fi";
import { Switch } from "@radix-ui/react-switch";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { set } from "react-hook-form";

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
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [writeAccessUsers, setWriteAccessUsers] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [writeAccess, setWriteAccess] = useState(false);

  const closeDialog = () => setIsDialogOpen(false);
  const closeAddUserDialog = () => setIsAddUserDialogOpen(false);

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
    if (note.isDirectory) {
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

  const fetchAllowedUsers = async () => {
    console.log("fetching access lists");
    try {
      const responseBundle = await axios.get(`/api/getAccessLists/${noteId}`);
      setAllowedUsers(responseBundle.data.readAccessList);
      setWriteAccessUsers(responseBundle.data.writeAccessList);
    } catch (error) {
      console.log("Failed to fetch access lists:", error);
    }
  };

  useEffect(() => {
    if (noteId) {
      fetchAllowedUsers();
    }
  }, [noteId]);

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
      className={`flex flex-col justify-start items-center w-full min-h-screen ${
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
      {note?.isDirectory ? null : (
        <Card className="w-auto max-w-[25rem] flex-grow flex flex-col justify-start items-center mx-8">
          <CardHeader className="text-center self-start">
            <CardTitle>Access Controls</CardTitle>
            <CardDescription>
              <span>{`Control which users have access to this ${
                note?.isDirectory
                  ? "directory, and thus its notes and subdirectories as well (unless manually overridden on a case by case basis)."
                  : "note."
              }`}</span>
            </CardDescription>
            <FiPlusCircle
              size={30}
              onClick={handleAddUserPress}
              className="cursor-pointer">
              Add User
            </FiPlusCircle>
          </CardHeader>
          <CardContent>
            <ScrollArea
              className="h-fit min-h-8 max-h-24 w-48 rounded-md border overflow-y-auto p-2"
              type="scroll">
              {allowedUsers
                .map((user, index) => (
                  <UserItem
                    key={index}
                    email={user}
                    writeAccess={checkWriteAccess(user)}
                    toggleWriteMode={toggleWriteMode}
                    removeUsersAccess={removeUsersAccess}
                  />
                ))
                .filter((_, index) => index !== 0)}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      <div className="flex-grow"></div>
      <div
        className={`${
          note?.isDirectory
            ? "flex"
            : "grid grid-cols-2 grid-rows-2 w-auto place-items-center"
        } col-start-2 row-start-4`}>
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
      </div>
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
    </main>
  );
};

export default NoteSettings;
