import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import React from "react";
import { Command, CommandItem } from "@/components/ui/command";
import { Template } from "@prisma/client";
import axios from "axios";



const ComboBox = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);

  const fetchTemplates = async () => {
    const response = await axios.get("/api/getTemplates");
    setTemplates(response.data);
  }

  fetchTemplates();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between">
          {value || "Select a template"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {/* Remove CommandInput and CommandEmpty if you don't need them */}
          {templates.length === 0 ? (
            <CommandItem>No templates found.</CommandItem>
          ) : (
            templates.map((template) => (
              <CommandItem
                key={template.id} // Assuming 'id' is a unique identifier
                onSelect={() => {
                  setValue(template.title); // Set the selected template's title as value
                  setOpen(false);
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
