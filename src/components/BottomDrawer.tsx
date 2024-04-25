"use client";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Image } from "lucide-react";

type SideDrawerProps = {
  lgMode: boolean;
};

const BottomDrawer = ({ lgMode }: SideDrawerProps) => {
  return (
    <Drawer direction="bottom">
      <DrawerTrigger>
        <Image
          size={lgMode ? 35 : 40}
          className={`cursor-pointer ${lgMode ? "mr-6 min-w-8" : ""}`}
        />
      </DrawerTrigger>
      <DrawerContent className="overflow-y-auto overflow-x-hidden h-24">
        
      </DrawerContent>
    </Drawer>
  );
};

export default BottomDrawer;
