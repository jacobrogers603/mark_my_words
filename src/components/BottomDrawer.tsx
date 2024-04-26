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
import { Card, CardContent } from "./ui/card";
import { useState } from "react";
import MediaCard from "./MediaCard";

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
}

const BottomDrawer = ({
  lgMode,
  files,
  filesLoading,
  noFilesMessage,
}: SideDrawerProps) => {
  const doNothing = () => {};

  return (
    <Drawer direction="bottom">
      <DrawerTrigger>
        <Image
          size={lgMode ? 35 : 40}
          className={`cursor-pointer ${lgMode ? "mr-6 min-w-8" : ""}`}
        />
      </DrawerTrigger>
      <DrawerContent className="h-fit p-4 grid place-items-center w-full text-center">
      <DrawerHeader className="text-center grid grid-rows-2 place-items-center">
        <DrawerTitle>Your photos</DrawerTitle>
        <DrawerDescription>Select a photo to add it to your note; you can add and manage your photos in user-settings</DrawerDescription>
      </DrawerHeader>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-[10rem] md:w-[80%]">
          <CarouselContent className="">
            {files.length > 0 ? (
              files.map((file) => (
                <CarouselItem
                  key={file.key}
                  className="basis-1/1 md:basis-1/3 lg:basis-1/4">
                  <MediaCard
                    key={file.key}
                    file={file}
                    deleteMedia={doNothing}
                    deletable={false}
                  />
                </CarouselItem>
              ))
            ) : (
              <p className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400 col-span-3">
                {noFilesMessage}
              </p>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomDrawer;
