import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandItem } from "@/components/ui/command";
import axios from "axios";
import { Template } from "@prisma/client";

interface ComboBoxProps {
  appendTemplate: (templateContent: string) => void;
  lgMode: boolean;
}

const ComboBox: React.FC<ComboBoxProps> = ({ appendTemplate, lgMode }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const response = await axios.get("/api/getTemplates");
      setTemplates(response.data);
    };

    fetchTemplates();
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit justify-between">
          {value || "Template"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[10rem] my-8 overflow-y-auto h-fit ${
          lgMode ? "max-h-[10rem]" : "max-h-screen"
        } z-50`}>
        <Command className="">
          {templates.length === 0 ? (
            <CommandItem>No templates found.</CommandItem>
          ) : (
            templates.map((template) => (
              <CommandItem
                className="overflow-x-auto"
                key={template.id}
                onSelect={() => {
                  setValue(template.title);
                  setOpen(false);
                  appendTemplate(template.content || "");
                }}>
                {template.title}
              </CommandItem>
            ))
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
