"use client";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import DirectoryItems from "@/components/DirectoryItems";
import NavBar from "@/components/NavBar";
import { FiPlusCircle } from "react-icons/fi";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const [currentDirNotes, setCurrentDirNotes] = useState([]);

  useEffect(() => {
    const fetchCurrentDirectory = async () => {
      try {
        const response = await axios.get("/api/getCurrentDirectoryNotes");
        setCurrentDirNotes(response.data);
      } catch (error) {
        console.log("Failed to fetch current directory", error);
      }
    };

    fetchCurrentDirectory();
  }, []);

  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    const fetchCurrentPath = async () => {
      try {
        const response = await axios.get("/api/getCurrentPath");
        setCurrentPath(response.data);
      } catch (error) {
        console.log("Failed to fetch current path", error);
      }
    };

    fetchCurrentPath();
  }, []);

  const updateCurrentPath = async (directoryId?: string) => {
    try {
      if (directoryId) {
        await axios.post("/api/setCurrentPath", { directoryId });
        setCurrentPath([...currentPath, directoryId]);
      } else {
        await axios.delete("/api/setCurrentPath");
        setCurrentPath(currentPath.slice(0, -1));
      }
    } catch (error) {
      console.log("Failed to update current path", error);
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
    <main className="flex min-h-screen flex-col items-center justify-between w-full mt-16 bg-white">
      <NavBar />
      <div className="col-start-1 col-end-1 md:col-end-3 bg-gradient-to-r from-orange-800 to-white w-full h-screen"></div>
      <div className="col-start-3 col-end-9 flex flex-col h-full items-center justify-between w-full bg-white pt-[5.5rem]">
        <DirectoryItems
          currentDirNotes={currentDirNotes}
          currentPath={currentPath}
          updateCurrentPath={updateCurrentPath}
        />
      </div>
      <div className="col-start-10 md:col-start-9 col-end-11 bg-gradient-to-l from-orange-800 to-white w-full h-screen"></div>
    </main>
  );
}
