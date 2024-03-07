"use client";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import CurrentDirectory from "@/components/CurrentDirectory";
import { useCallback, useState } from "react";
import axios from "axios";

export default function Home() {
  const router = useRouter();

  // const { data: user } = useCurrentUser();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const routeToNotes = () => {
    router.push("/notes");
  };

  const createNote = () => {
    router.push("/editor");
  };

  const [directoryTitle, setDirectoryTitle] = useState("");
  const createDirectory = useCallback(async () => {
    try {
      await axios.post("/api/saveNote", {
        title: directoryTitle,
        content: "",
        isDirectory: true,
      });
    } catch (error) {
      console.log(error);
    }
    setDirectoryTitle("");
  }, [directoryTitle]);

  const handleDirectoryTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDirectoryTitle(event.target.value);
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Main Page
      <CurrentDirectory />
      <button className="h-10 w-auto bg-amber-700" onClick={createNote}>
        Create Note
      </button>
      <button className="h-10 w-auto bg-amber-400" onClick={createDirectory}>
        Create Directory
      </button>
      <input
        className="border-solid border-black border-2"
        placeholder="Dir Title"
        type="text"
        value={directoryTitle}
        onChange={handleDirectoryTitleChange}
      />
      <button className="h-10 w-auto bg-red-200" onClick={() => signOut()}>
        Sign Out
      </button>
    </main>
  );
}
