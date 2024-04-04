"use client";
import NavBar from "@/components/NavBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Template } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Home, X } from "lucide-react";
import TemplateItem from "@/components/TemplateItem";
import { set } from "react-hook-form";

const userSettings = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const fetchTemplates = async () => {
    const response = await axios.get("/api/getTemplates");
    console.log("fetching templates");
    console.log(response.data);
    return response.data;
  };

  const updateTemplates = async () => {
    console.log("updating templates");
    const updatedTemplates = await fetchTemplates();
    setTemplates(updatedTemplates);
    console.log("templates:", templates);
  };

  const saveTemplate = async () => {
    console.log("saving template");
    await axios.post("/api/saveTemplate", {
      title: templateTitle,
      content: templateContent,
    });
    setIsDialogOpen(false);
    updateTemplates();
  };

  const handleTemplateTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTemplateTitle(event.target.value);
  };

  const handleTemplateContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTemplateContent(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const templates = await fetchTemplates();
      setTemplates(templates);
    };

    fetchData();
  }, []);

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const handleSaveTemplateClick = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const deleteTemplate = async (templateId: string) => {
    console.log("deleting template, templateId:", templateId);

    try {
      const res = await axios.delete(`/api/deleteTemplate`, {
        data: { templateId: templateId },
      });
      console.log("deleted:", res);
    } catch (error) {
      console.error("deleteTemplate tryCatch error:", error);
    }

    updateTemplates();
  };

  const routeHome = () => {
    router.push("/");
  };

  if (status === "loading") {
    return (
      <main className="w-full h-screen grid place-items-center">
        <div className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full h-screen place-items-center">
      <NavBar />
      {isDialogOpen && (
        <Dialog open={isDialogOpen}>
          <DialogContent className="w-auto flex flex-col place-items-center">
            <DialogHeader>
              <DialogTitle>Title your new template</DialogTitle>
            </DialogHeader>
            <Input
              id="title"
              placeholder="Template title"
              value={templateTitle}
              onChange={handleTemplateTitleChange}
              className="row-start-2 col-span-2 w-30"
            />
            <DialogFooter className="flex">
              <Button
                variant={templateTitle === "" ? "secondary" : "default"}
                disabled={templateTitle === "" ? true : false}
                onClick={saveTemplate}>
                Save template
              </Button>
              <Button className="ml-2" onClick={closeDialog}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Card className="w-auto h-auto mt-16 grid place-items-center grid-cols-2 grid-rows-5 border-solid border-gray-500 rounded-md border-2 mb-6 min-w-[470px]">
        <CardHeader className="text-center col-span-2 ">
          <CardTitle className="font-extrabold">Current Templates</CardTitle>
          <CardDescription>
            Create your own predefined templates for your notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-evenly col-start-1 col-end-3 row-start-2 row-end-6 w-full">
          <ScrollArea
            className="col-start-1 col-end-2 h-80 w-48 rounded-md border overflow-hidden"
            type="scroll">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Templates
              </h4>
              {templates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  onDelete={deleteTemplate}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="grid gap-1.5 row-start-3 m-4 col-start-2 col-end-3 min-w">
            <Label className="font-extrabold" htmlFor="template">Define a new template</Label>
            <Textarea
              className="whitespace-pre-wrap min-h-80"
              placeholder={`# Lorem Ipsum
        
        Ut dolorum, repudiandae aut excepturi, neque consectetur quidem veritatis saepe fugit animi magni alias odit ipsa asperiores aliquam.
        
        ##  Dolorum quia
        
        - Unus
        - duo
        - tribus
        - quattuor
        `}
              id="template"
              value={templateContent}
              onChange={handleTemplateContentChange}
            />
            <Button
              variant={templateContent === "" ? "secondary" : "default"}
              disabled={templateContent === "" ? true : false}
              onClick={handleSaveTemplateClick}>
              Save template
            </Button>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <Button className="mr-2 w-[9rem]" onClick={routeHome}>
        <Home size={15} />
        <span className="ml-2">Home</span>
      </Button>
      <Button className="mr-2 w-[9rem] mt-4" variant={"destructive"} disabled={true}>
        <span className="ml-2">Delete account</span>
      </Button>
    </main>
  );
};

export default userSettings;
