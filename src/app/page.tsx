"use client";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import DirectoryItems from "@/components/DirectoryItems";
import NavBar from "@/components/NavBar";
import { FiPlusCircle } from "react-icons/fi";
import { PencilRuler } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

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

  const routeHome = () => {
    router.push("/");
  };

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
    <main className="h-screen w-full flex flex-col items-center justify-between">
      <NavBar routeHomeProvided={false} userProvided={false}/>
      <h1 className="mt-[6.5rem] font-semibold text-2xl p-2 border-2 border-black rounded-md">
        Private Profile
      </h1>
      <div className="mt-4 h-full w-[80%] md:w-[65%] lg:w-[50%]">
        <DirectoryItems
          currentPath={currentPath}
          updateCurrentPath={updateCurrentPath}
          isPublic={false}
          status={status}
          currentUserIsCreator={true}
        />
      </div>
    </main>
  );
}
