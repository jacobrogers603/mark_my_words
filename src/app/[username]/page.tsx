"use client";
import DirectoryItems from "@/components/DirectoryItems";
import NavBar from "@/components/NavBar";
import axios from "axios";
import { PencilRuler } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const PublicProfile = () => {
  const { username } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentDirNotes, setCurrentDirNotes] = useState([]);

  useEffect(() => {
    const fetchPublicDirId = async () => {
      try {
        const response = await axios.get(`/api/getPublicDir/${username}`);
        if (response) {
          setCurrentPath([response.data]);
        }
      } catch (error) {
        console.error("Failed to fetch public directory ID:", error);
      }
    };

    fetchPublicDirId();
  }, [username]); // Ensure this effect runs once per username change

  useEffect(() => {
    const fetchCurrentDirectory = async () => {
      console.log("currentPath", currentPath);
      try {
        const response = await axios.get(
          `/api/getPublicCurDirNotes/${currentPath[currentPath.length - 1]}`
        );
        setCurrentDirNotes(response.data);
      } catch (error) {
        console.error("Failed to fetch current directory notes:", error);
      }
    };

    if (currentPath.length > 0) {
      fetchCurrentDirectory();
    }
  }, [currentPath]); // This effect depends on `currentPath`

  if (status === "loading") {
    return (
      <main className="w-full h-screen grid place-items-center pt-14">
        <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
          <PencilRuler
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

  const routeHome = () => {
    router.push("/");
  };

  const updateCurrentPath = async (directoryId?: string) => {
    if (directoryId) {
      setCurrentPath([...currentPath, directoryId]);
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  return (
    <main className="h-screen w-full pt-14 flex flex-col items-center justify-between">
      <NavBar />
      <DirectoryItems
        currentDirNotes={currentDirNotes}
        currentPath={currentPath}
        updateCurrentPath={updateCurrentPath}
        isPublic={true}
        status={status}
      />
    </main>
  );
};

export default PublicProfile;
