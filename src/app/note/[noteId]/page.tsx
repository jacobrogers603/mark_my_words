"use client";
import useNote from "@/hooks/useNote";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useParams } from "next/navigation";
import React from "react";
import DOMPurify from "dompurify";
import "../../../../markdown.css";

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

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      FORBID_TAGS: ['script', 'style', 'form', 'input', 'textarea', 'button'],
      FORBID_ATTR: ['onclick', 'onmouseover', 'onmouseout', 'onkeydown', 'onload'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOW_ARIA_ATTR: false,
      ADD_ATTR: ['target'], // Allow the target attribute for new tabs on links
    });
  };
  
  
  const renderMarkdown = () => {
    if(!note || !note.htmlContent || note.htmlContent === ""){
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
    <main className="w-full h-screen grid place-items-center">
      <button className="h-10 w-auto bg-amber-700" onClick={routeHome}>
        Back
      </button>
      <div className="w-[80%] h-screen mt-12 ml-16 mr-4 border-solid border-black border-2">
        {/* <p>{note?.htmlContent}</p> */}
        {/* <p>--------------</p> */}
        <div className="markdown-content"
        dangerouslySetInnerHTML={{
          __html: renderMarkdown(),
        }}
      />
      </div>
    </main>
  );
};

export default note;
