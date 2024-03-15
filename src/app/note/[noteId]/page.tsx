"use client";
import useNote from "@/hooks/useNote";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useParams } from "next/navigation";
import React from "react";

const note = () => {
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
    <main className="grid place-items-center">
      <div className="">{note?.content}</div>
    </main>
  );
};

export default note;
