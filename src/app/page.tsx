"use client";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import axios from "axios";
import DirectoryItems from "@/components/DirectoryItems";
import useCurrentDirectory from "@/hooks/useCurrentDirectory";
import useCurrentPath from "@/hooks/useCurrentPath";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

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

  const { data: currentDirNotes = [] } = useCurrentDirectory();
  const { data: currentPathIds = [] } = useCurrentPath();


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
      <DirectoryItems currentDirNotes={currentDirNotes} currentPath={currentPathIds} />
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
