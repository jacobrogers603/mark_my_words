"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import "../../../../markdown.css";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { NotebookText, Home, PencilRuler } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import axios from "axios";
import { set } from "react-hook-form";

interface User {
  id: string;
  email: string;
  username: string;
}

interface Note {
  content: string;
  htmlContent: string;
}

const Note = () => {
  const { noteId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [note, setNote] = useState<Note>();
  const [user, setUser] = useState<User>();
  const [hasReadAccess, setHasReadAccess] = useState(false);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [publicNote, setPublicNote] = useState(false);
  const [noteUserId, setNoteUserId] = useState<string>("");
  const [noteUsername, setNoteUsername] = useState<string>("");

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/getCurrentUsername");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchNoteUsername = async () => {
    if (!noteUserId) return;
    try {
      const response = await axios.get(`/api/getUsernameById/${noteUserId}`);
      setNoteUsername(response.data.username);
    } catch (error) {
      console.error("Failed to fetch note username", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        fetchUser();
        return;
      }
      try {
        const { data } = await axios.get(`/api/getAccessLists/${noteId}`);
        // public viewer
        if (status === "unauthenticated") {
          const hasAccess = data.readAccessList.includes("public");
          hasAccess ? setPublicNote(true) : setPublicNote(false);
          setHasReadAccess(hasAccess);
          setHasWriteAccess(false);
          setIsCreator(false);

          const { data: noteUserId } = await axios.get(
            `/api/getNoteUserId/${noteId}`
          );

          setNoteUserId(noteUserId);

          if (!hasAccess) {
            router.push("/unauthorized");
          }
        }
        // logged in viewer
        else if (status === "authenticated") {
          var hasAccess = false;
          if (data.readAccessList.includes("public")) {
            hasAccess = true;
            setPublicNote(true);
          } else {
            hasAccess = data.readAccessList.includes(user.email);
          }
          const hasWriteAccess = data.writeAccessList.includes(
            session?.user?.email
          );
          setHasReadAccess(hasAccess);
          setHasWriteAccess(hasWriteAccess);

          if (!hasAccess) {
            router.push("/unauthorized");
          }

          const { data: noteUserId } = await axios.get(
            `/api/getNoteUserId/${noteId}`
          );

          setNoteUserId(noteUserId);

          const noteCreator = noteUserId === user.id;
          setIsCreator(noteCreator);
        }
      } catch (error) {
        console.error("Failed to fetch access list", error);
      }
    };

    if (noteId && user && status !== "loading") {
      checkAccess();
    }
  }, [noteId, user, status]);

  useEffect(() => {
    if (hasReadAccess && noteId) {
      const fetchNote = async () => {
        try {
          const response = await axios.get<Note>(`/api/getNote/${noteId}`);
          setNote(response.data);
        } catch (error) {
          console.error("Failed to fetch note", error);
        }
      };
      fetchNote();
    }
  }, [hasReadAccess, noteId]);

  useEffect(() => {
    if (noteUserId) {
      fetchNoteUsername();
    }
  }, [noteUserId]);

  const routeHome = () => {
    if (noteUsername && publicNote) {
      router.push(`/${noteUsername}`);
    } else {
      router.push("/");
    }
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

  if (status === "loading" || !hasReadAccess) {
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
    <main className="w-full h-full min-h-screen grid grid-cols-10 bg-blue-100 content-start">
      <NavBar
        routeHomeProvided={true}
        routeHome={routeHome}
        userProvided={true}
        userProp={user}
      />
      <div className="mt-[5.25rem] mb-2 grid grid-cols-2 grid-rows-2  md:flex flex-row col-start-2 col-end-10 justify-self-start">
        <Button className="mr-2 w-[9rem] mb-4 md:mb-0" onClick={routeHome}>
          <Home size={15} />
          <span className="ml-2">Home</span>
        </Button>
        {status === "authenticated" ? (
          <Button
            className="mr-2 w-[9rem] mb-4 md:mb-0"
            disabled={!hasWriteAccess}
            onClick={routeEdit}>
            <FaEdit />
            <span className="ml-2">Edit note</span>
          </Button>
        ) : null}
        {status === "authenticated" ? (
          <Button
            className={`w-[9rem] ${
              isCreator ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            disabled={!isCreator}
            onClick={routeSettings}>
            <IoSettingsSharp />
            <span className="ml-2">Note settings</span>
          </Button>
        ) : null}
      </div>
      <div className="h-fit mt-6 border-solid border-black border-2 rounded-md col-start-2 col-end-10 w-full bg-white p-4 mb-12">
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

export default Note;
