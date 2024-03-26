"use client";
import useNote from "@/hooks/useNote";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import React from "react";

const noteSettings = () => {
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

  const goHome = () => {
    router.push("/");
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
    goHome();
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
    <main className="grid w-full h-screen place-items-center">
      <h1>Settings: {note?.title}</h1>
      <button className="h-10 w-auto bg-amber-700" onClick={goHome}>
        Back
      </button>
      <button className="h-10 w-auto bg-red-500" onClick={handleDelete}>
        Delete
      </button>
    </main>
  );
};

export default noteSettings;
