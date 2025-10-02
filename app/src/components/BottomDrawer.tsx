"use client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Image } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MediaCard from "./MediaCard";
import { Dispatch, SetStateAction, useState } from "react";

interface MediaFile {
  key: string;
  blob: Blob;
  lastModified: Date;
}

interface SideDrawerProps {
  lgMode: boolean;
  files: MediaFile[];
  filesLoading: boolean;
  noFilesMessage: string;
  appendImageLink: (altText: string, link: string) => void;
  currentUserId: string;
  noteId: string;
  handleTextAreaChange: () => void;
}

const BottomDrawer = ({
  lgMode,
  files,
  filesLoading,
  noFilesMessage,
  appendImageLink,
  currentUserId,
  noteId,
  handleTextAreaChange,
}: SideDrawerProps) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const toggleDrawer = () => {
    setIsOpened(!isOpened);
  };

  return (
    <Drawer
      direction="bottom"
      open={isOpened}
      onOpenChange={(open) => setIsOpened(open)}>
      <DrawerTrigger>
        <Image
          size={lgMode ? 35 : 40}
          onClick={toggleDrawer}
          className={`cursor-pointer ${lgMode ? "mr-6 min-w-8" : ""}`}
        />
      </DrawerTrigger>
      <DrawerContent className="h-fit p-4 grid place-items-center w-full text-center">
        <DrawerHeader className="text-center grid grid-rows-2 place-items-center">
          <DrawerTitle>Your photos</DrawerTitle>
          <DrawerDescription>
            Select a photo to add it to your note; you can add and manage your
            photos in user-settings
          </DrawerDescription>
        </DrawerHeader>
        <Carousel
          opts={{
            align: "start",
          }}
          orientation="horizontal"
          className="w-[10rem] md:w-[80%]">
          <CarouselContent
            className={`${files.length <= 0 ? "grid place-items-center" : ""}`}>
            {files.length > 0 ? (
              files.map((file) => (
                <CarouselItem
                  key={file.key}
                  className="basis-1/1 md:basis-1/3 lg:basis-1/4">
                  <MediaCard
                    key={file.key}
                    file={file}
                    editor={true}
                    appendImageLink={appendImageLink}
                    currentUserId={currentUserId}
                    noteId={noteId}
                    closeDrawer={toggleDrawer}
                    handleTextAreaChange={handleTextAreaChange}
                  />
                </CarouselItem>
              ))
            ) : (
              <p className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400 col-span-3 self-center justify-self-center">
                {noFilesMessage}
              </p>
            )}
          </CarouselContent>
          {files.length > 0 ? <CarouselPrevious /> : null}
          {files.length > 0 ? <CarouselNext /> : null}
        </Carousel>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomDrawer;
