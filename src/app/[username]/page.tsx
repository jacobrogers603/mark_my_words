"use client";
import NavBar from "@/components/NavBar";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
  const { username } = useParams();
  return (
    <main className="h-screen w-full pt-14">
      <NavBar />
      {username}
    </main>
  );
};

export default page;
