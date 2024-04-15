import { Template } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";
import { Toggle } from "@/components/ui/toggle";
import axios from "axios";
import { X, PencilLine } from "lucide-react";
import React from "react";

interface UserItemProps {
  email: string;
  writeAccess: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ email, writeAccess }) => {
    const handleXClick = () => {
    //   console.log("onDelete(", template.id, ")");
    //   onDelete(template.id); // This will call the deleteTemplate function in the parent component
    };

  return (
    <>
      <div className="flex relative w-full">
        <div className="text-sm">{email}</div>
        <Toggle aria-label="Toggle italic">
          <PencilLine className="mr-2 h-4 w-4" />
          Write Access
        </Toggle>
        <div className="cursor-pointer">
          <X onClick={handleXClick} size={20} className="absolute right-2" />
        </div>
      </div>
      <Separator className="h-[1px] bg-gray-400 my-2" />
    </>
  );
};

export default UserItem;
