"use client";
import NavBar from "@/components/NavBar";
import SharedItem from "@/components/SharedItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";
import { PencilRuler } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { set } from "react-hook-form";

interface User {
  id: string;
  email: string;
  username: string;
}

interface NoteIdentifier {
  title: string;
  id: string;
  noteCreator: User;
  readAccessList: string[];
  writeAccessList: string[];
}

const Shared = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const getUser = async () => {
    try {
      const response = await axios.get("/api/getCurrentUsername");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      getUser();
    }
  }, [currentUser]);

  const router = useRouter();
  const routeHome = () => {
    router.push("/");
  };

  const [sharedWithMeNotes, setSharedWithMeNotes] = useState<NoteIdentifier[]>(
    []
  );
  const [loadingNotes, setLoadingNotes] = useState<boolean>(true);
  // const [loadedUsernames, setLoadedUsernames] = useState<boolean>(false);

  // const addUsernames = async () => {
  //   const notesWithoutUsernames = sharedWithMeNotes;
  //   let retval: NoteIdentifier[] = [];

  //   notesWithoutUsernames.forEach(async (note) => {
  //     try {
  //       const response = await axios.get(
  //         `/api/getUsernameById/${note.noteCreator.id}`
  //       );
  //       const noteRetval: NoteIdentifier = {
  //         title: note.title,
  //         id: note.id,
  //         noteCreator: {
  //           id: note.noteCreator.id,
  //           email: note.noteCreator.email,
  //           username: response?.data.username,
  //         },
  //         readAccessList: note.readAccessList,
  //         writeAccessList: note.writeAccessList,
  //       };

  //       retval.push(noteRetval);
  //     } catch (error) {
  //       console.error("Failed to fetch username:", error);
  //     }
  //   });
  //   console.log(retval);
  //   setSharedWithMeNotes(retval);
  //   setLoadedUsernames(true);
  // };

  const fetchSharedNotes = async () => {
    try {
      const response = await axios.get(
        `/api/getSharedWithMeNotes/${currentUser?.id}`
      );

      if (response.data) {
        console.log(response.data);
        setSharedWithMeNotes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch shared notes:", error);
    }
    setLoadingNotes(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchSharedNotes();
    }
  }, [currentUser]);

  // can't get this to work for now.
  // useEffect(() => {
  //   if (sharedWithMeNotes.length > 0) {
  //     setLoadedUsernames(false);
  //     addUsernames();
  //   }
  // }, [sharedWithMeNotes]);

  if (status === "loading") {
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
    <main className="w-full h-screen flex flex-col justify-start items-center pt-14">
      <NavBar
        routeHomeProvided={false}
        userProvided={true}
        userProp={currentUser}
      />
      <h1 className="mt-12 font-semibold text-2xl p-2 border-2 border-black rounded-md">
        Shared with you
      </h1>
      <div className="mt-12 w-[80%] md:w-[60%] flex flex-col items-center">
        {sharedWithMeNotes.length > 0 && currentUser ? (
          sharedWithMeNotes.map((note) => (
            <SharedItem key={note.id} note={note} currentUser={currentUser} />
          ))
        ) : sharedWithMeNotes.length === 0 && currentUser ? (
          <div className="flex justify-center items-center w-fit h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400">
            {loadingNotes ? "Loading..." : "No notes shared with you"}
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Shared;
