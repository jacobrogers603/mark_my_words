"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

export default function Notes() {

  const router = useRouter();

  const { data: session, status } = useSession({ 
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const routeHome = () => {
    router.push("/");
  }

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
    <main className="bg-amber-100">
      Notes
      <button className="bg-blue-200 w-auto h-10" onClick={routeHome}>Home</button>
    </main>
    );
}
