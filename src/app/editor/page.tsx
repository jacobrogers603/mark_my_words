"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import ComboBox from "@/components/ComboBox";
import { HiDotsHorizontal } from "react-icons/hi";
import FormattingButton from "@/components/FormattingButton";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { set } from "react-hook-form";

export default function Editor() {
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
  };

  const [noteText, setNoteText] = useState("");
  const [title, setTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const saveNote = useCallback(() => {
    const currentText = textAreaRef.current ? textAreaRef.current.value : '';
    const currentTitle = titleRef.current ? titleRef.current.value : ''; 
    setNoteText(currentText);
    setTitle(currentTitle);

    if (currentTitle === "") {
      setIsDialogOpen(true);
    } else {
      console.log("Note saving");
    }
  },[]);

  const closeDialog = () => setIsDialogOpen(false);

  useEffect(() => {
    console.log('noteText:', noteText);
    console.log('title:', title);
  }, [noteText, title]);

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
      <div className="absolute top-[40%] right-[40%] z-10">
        {/* Dialog component */}
        {isDialogOpen && (
          <Dialog open={isDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Missing Information</DialogTitle>
                <DialogDescription>
                  Your note needs a title before you can save it.
                </DialogDescription>
              </DialogHeader>
              {/* Close button or similar action */}
              <button onClick={closeDialog}>Close</button>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="relative border-solid border-black border-2 rounded-md w-[80%] h-[75%]">
        <nav className="absolute top-0 right-0 left-0 h-16 grid grid-rows-1 grid-cols-5 place-items-center border-b-2 border-b-black">
          <div className="grid grid-cols-1 grid-rows-2 place-items-center">
            <h1 className="font-bold text-lg">Note Editor</h1>
            <p className="text-gray-500">Markdown Format</p>
          </div>
          <div className="flex flex-col">
            <label className="ml-2 text-gray-700">Title</label>
            <input
              type="text"
              placeholder=""
              ref={titleRef}
              className="border-solid border-2 border-black rounded-lg"
            />
          </div>
          <div className="col-start-4">
            <ComboBox />
          </div>
          <div className="flex">
            <button
              onClick={saveNote}
              className="rounded-lg py-2 px-4 bg-black text-white font-bold">
              Save
            </button>
            <button className="ml-2 rounded-lg py-2 px-4 bg-gray-500 text-white font-bold">
              <HiDotsHorizontal />
            </button>
          </div>
        </nav>
        <div className="grid grid-cols-5 grid-rows-1 w-full absolute top-16 bottom-0 right-0 left-0 place-items-center">
          <div className="grid place-items-center col-start-1 col-end-5 w-full h-full">
            <textarea
              className="focus:outline-none focus:shadow-none h-[90%] w-[90%] resize-none border-gray-500 border-[1px] rounded-lg"
              placeholder=" Start writing..."
              ref={textAreaRef}></textarea>
          </div>
          {/* formatting bar */}
          <div className="p-4 flex flex-col col-start-5 h-full border-l-2 border-l-black ">
            <FormattingButton name="Bold" />
            {/* <FormattingButton name="H1" />
                <FormattingButton name="H2" />
                <FormattingButton name="H3" />
                <FormattingButton name="italic" />
                <FormattingButton name="link" />
                <FormattingButton name="image" />
                <FormattingButton name="list" />
                <FormattingButton name="code" /> */}
          </div>
        </div>
      </div>
    </main>
  );
}
