import { Template } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";
import axios from "axios";
import { X } from "lucide-react";
import React from "react";

const templateItem = ({ template }: { template: Template }) => {
  const handleXClick = async () => {
    await axios.delete(`/api/saveTemplate/${template.id.toString()}`);
  };

  return (
    <>
      <div key={template?.id} className="flex relative w-full">
        <div className="text-sm">{template?.title}</div>
        <div className="cursor-pointer">
            <X onClick={handleXClick} size={20} className="absolute right-2" />
        </div>
      </div>
      <Separator className="h-[1px] bg-gray-400 my-2" />
    </>
  );
};

export default templateItem;
