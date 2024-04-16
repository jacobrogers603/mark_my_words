import { Template } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";
import { Toggle } from "@radix-ui/react-toggle";
import axios from "axios";
import { X, PencilLine } from "lucide-react";
import React from "react";

interface UserItemProps {
  email: string;
  writeAccess: boolean;
  toggleWriteMode: (email: string, writeAccess: boolean) => void;
  removeUsersAccess: (email: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({ email, writeAccess, toggleWriteMode, removeUsersAccess }) => {

  return (
    <>
      <div className="flex relative w-full">
        <div className="text-sm overflow-auto w-[70%] mr-4">{email}</div>
        <div className="flex-grow"></div>
        <PencilLine
          className={`mr-2 h-4 w-4 ${
            writeAccess ? "text-black" : "text-gray-200"
          } cursor-pointer`}
          onClick={() => toggleWriteMode(email, writeAccess)}
        />
        <div className="ml-8 cursor-pointer">
          <X onClick={() => removeUsersAccess(email)} size={20} className="absolute right-2" />
        </div>
      </div>
      <Separator className="h-[1px] bg-gray-400 my-2" />
    </>
  );
};

export default UserItem;
