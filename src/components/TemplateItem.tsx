import { Template } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";
import axios from "axios";
import { X } from "lucide-react";
import React from "react";

interface TemplateItemProps {
  template: Template;
  onDelete: (templateId: string) => Promise<void>;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onDelete }) => {
  const handleXClick = () => {
    console.log("onDelete(", template.id, ")");
    onDelete(template.id); // This will call the deleteTemplate function in the parent component
  };

  return (
    <>
      <div className="flex relative w-full">
        <div className="text-sm overflow-auto w-[70%] mr-4">{template.title}</div>
        <div className="w-[10%] cursor-pointer">
          <X onClick={handleXClick} size={20} className="absolute right-2" />
        </div>
      </div>
      <Separator className="h-[1px] bg-gray-400 my-2" />
    </>
  );
};

export default TemplateItem;
