"use client";
import useNote from "@/hooks/useNote";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useParams } from "next/navigation";
import React from "react";
import DOMPurify from "dompurify";
import "../../../../markdown.css";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { NotebookText, Home } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

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

  const routeHome = () => {
    router.push("/");
  };

  const routeEdit = () => {
    router.push(`/editor/${noteId}`);
  };

  const routeSettings = () => {
    router.push(`/note/settings/${noteId}`);
  };

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      FORBID_TAGS: ["script", "style", "form", "input", "textarea", "button"],
      FORBID_ATTR: [
        "onclick",
        "onmouseover",
        "onmouseout",
        "onkeydown",
        "onload",
      ],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOW_ARIA_ATTR: false,
      ADD_ATTR: ["target"], // Allow the target attribute for new tabs on links
    });
  };

  const renderMarkdown = () => {
    if (!note || !note.htmlContent || note.htmlContent === "") {
      return "";
    }

    const sanitizedHtml = sanitizeHtml(note?.htmlContent);
    return sanitizedHtml;
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
    <main className="w-full h-full min-h-screen grid grid-cols-10 bg-blue-100 content-start">
      <NavBar />
      <div className="mt-[5.25rem] mb-2 flex col-start-2 justify-self-start">
        <Button className="mr-2 w-[9rem]" onClick={routeHome}>
          <Home size={15}/>
          <span className="ml-2">Home</span>
        </Button>
        <Button className="mr-2 w-[9rem]" onClick={routeEdit}>
          <FaEdit />
          <span className="ml-2">Edit note</span>
        </Button>
        <Button className="w-[9rem]" onClick={routeSettings}>
          <IoSettingsSharp />
          <span className="ml-2">Note settings</span>
        </Button>
      </div>
      <div className="h-fit mt-6 border-solid border-black border-2 rounded-md col-start-2 col-end-10 w-full bg-white p-4 mb-12">
        {/* <p>{note?.htmlContent}</p> */}
        {/* <p>--------------</p> */}
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(),
          }}
        />
      </div>
    </main>
  );
};

export default note;

