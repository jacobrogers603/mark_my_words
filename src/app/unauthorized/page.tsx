"use client";
import { PencilRuler } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const unauthorized = () => {
  const router = useRouter();

  const routeHome = () => {
    router.push("/");
  };

  return (
    <main className="w-full h-screen grid place-items-center pt-14">
      <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
        <PencilRuler
          onClick={routeHome}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      </nav>
      <div className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-[3px] text-black font-semibold bg-red-600 cursor-not-allowed">
        Access denied
      </div>
    </main>
  );
};

export default unauthorized;
