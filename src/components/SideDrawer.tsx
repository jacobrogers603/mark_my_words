"use client";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Home, MenuIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { IoSettingsSharp } from "react-icons/io5";
import ComboBox from "./ComboBox";
import { Label } from "@radix-ui/react-label";

type SideDrawerProps = {
  lgMode: boolean;
  routeHome: () => void;
  saveNote: () => void;
  isSaved: boolean;
  routeSettings: () => void;
  appendTemplate: (template: string) => void;
  noteId: string;
  title: string;
  setTitle: (title: string) => void;
  handleTextareaChange: () => void;
  titleRef: React.RefObject<HTMLInputElement>;
};

const SideDrawer = ({
  lgMode,
  routeHome,
  saveNote,
  isSaved,
  routeSettings,
  appendTemplate,
  noteId,
  title,
  setTitle,
  handleTextareaChange,
  titleRef,
}: SideDrawerProps) => {
  return (
    <Drawer direction="right">
      <DrawerTrigger>
        <MenuIcon />
      </DrawerTrigger>
      <DrawerContent className="overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-2 grid-rows-3 gap-4 place-items-center p-2">
          {!lgMode ? (
            <Button className="w-fit justify-self-start" onClick={routeHome}>
              <Home size={15} />
              <span className="ml-2">Home</span>
            </Button>
          ) : null}
          {!lgMode ? (
            <div className="flex flex-col">
              <label htmlFor="title" className="font-bold">Title</label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleTextareaChange();
                }}
                ref={titleRef}
                className="border-solid border-2 border-gray-600 rounded-lg w-full col-start-2 row-start-1 mr-2"
              />
            </div>
          ) : null}
          {noteId !== "new" && !lgMode ? (
            <Button className="w-fit justify-self-start" onClick={routeSettings}>
              <IoSettingsSharp />
              <span className="ml-2">Note settings</span>
            </Button>
          ) : null}
          {!lgMode ? (
            <Button
              onClick={saveNote}
              variant={isSaved ? "secondary" : "default"}
              disabled={isSaved}
              className="w-fit justify-self-end">
              {isSaved ? "Saved" : "Save"}
            </Button>
          ) : null}          
          {!lgMode ? (
            <div className="grid place-items-center w-full col-span-2">
              <ComboBox appendTemplate={appendTemplate} />
            </div>
          ) : null}
        </div>

        {/* Md cheat sheet info */}
        <div className="p-4 flex flex-col col-start-5 h-auto w-auto p-2 border-black border-solid rounded-md text-center">
          <h2 className="font-extrabold">Markdown Cheat Sheet</h2>
          <Separator
            className="h-[2px] bg-gray-800 my-2"
            orientation="horizontal"
          />
          <ul>
            <li>
              <span className="font-bold italic"># Text</span> Heading
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">## Text</span> Sub Heading (max
              6)
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">*Text*</span> Italic
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">**Text**</span> Bold
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">~~Text~~</span> Strikethrough
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">- List Item</span> Bulleted
              List
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">1. List Item</span> Numeric
              List
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">`Code`</span> Code Block
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">---</span> Horizontal Line
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">[Link Text](URL)</span> Link
            </li>
            <Separator
              className="h-[2px] bg-gray-800 my-2"
              orientation="horizontal"
            />
            <li>
              <span className="font-bold italic">![Alt Text](Image Path)</span>{" "}
              Image
            </li>
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SideDrawer;
