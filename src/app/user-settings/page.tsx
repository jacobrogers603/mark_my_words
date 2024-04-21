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
import axios, { AxiosResponse } from "axios";
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
import { ArrowDownFromLine, Home, PencilRuler, X } from "lucide-react";
import TemplateItem from "@/components/TemplateItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { set } from "react-hook-form";
import { FiPlus, FiPlusCircle } from "react-icons/fi";
import { S3 } from "aws-sdk";
import S3UploadForm from "@/components/S3UploadForm";
import { JsonObject } from "@prisma/client/runtime/library";
import MediaCard from "@/components/MediaCard";

interface FolderContentsProps {
  folderPath: string;
}

interface FileDetails {
  key: string;
  title: string;
  lastModified: string;
}

interface User {
  id: string;
}

const UserSettings = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [noFilesMessage, setNoFilesMessage] = useState<string>("");

  const fetchTemplates = async () => {
    const response = await axios.get("/api/getTemplates");
    return response.data;
  };

  const updateTemplates = async () => {
    console.log("updating templates");
    const updatedTemplates = await fetchTemplates();
    setTemplates(updatedTemplates);
    console.log("templates:", templates);
  };

  const saveTemplate = async () => {
    await axios.post("/api/saveTemplate", {
      title: templateTitle,
      content: templateContent,
    });
    setIsDialogOpen(false);
    updateTemplates();
    setTemplateTitle("");
    setTemplateContent("");
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

  const closeUploadDialog = () => {
    setIsUploadDialogOpen(false);
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

  const handleDownloadHtmlPress = async () => {
    try {
      const rootNote = await axios.get(`/api/getNote/root`);
      if (!rootNote) {
        console.error("No root note found");
        return;
      }

      const rootId = rootNote.data.id;
      const rootTitle = rootNote.data.title;

      const response: AxiosResponse<Blob> = await axios.post<Blob>(
        "/api/downloadDirectory",
        {
          id: rootId,
          htmlMode: true,
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${rootTitle}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download directory", error);
    }
  };

  const handleImageUpload = async (
    file: File,
    userId: string
  ): Promise<string> => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileType: file.type,
        fileName: file.name,
        userId,
      }),
    });

    const { signedRequest, url } = (await res.json()) as {
      signedRequest: string;
      url: string;
    };

    // Upload the file to the S3 bucket using the pre-signed URL
    const result = await fetch(signedRequest, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (result.ok) {
      console.log("Uploaded successfully:", url);
      return url; // This URL can be used in markdown
    } else {
      throw new Error("Failed to upload image.");
    }
  };

  const deleteMedia = () => {};

  const addMedia = () => {
    setIsUploadDialogOpen(true);
  };

  // Fetch the current user.
  useEffect(() => {
    const getUser = async () => {
      try {
        setFilesLoading(true);
        setNoFilesMessage("Files loading...");
        const response = await axios.get("/api/current");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    getUser();
  }, []);

  // Fetch user's media files once the currentUser is set
  useEffect(() => {
    if (currentUser && currentUser.id) {
      setFilesLoading(true);
      const fetchFiles = async () => {
        try {
          const response = await axios.get(
            `/api/getUsersMedia/${currentUser.id}`
          );
          setFilesLoading(false);
          if (response.data.files.length === 0) {
            setNoFilesMessage("No files found");
          }
          setFiles(response.data.files);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      };

      fetchFiles();
    }
  }, [currentUser]);

  if (status === "loading") {
    return (
      <main className="w-full h-screen grid place-items-center pt-14">
        <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
          <PencilRuler
            onClick={routeHome}
            size={30}
            className="col-start-1 hover:cursor-pointer"
          />
        </nav>
        <div className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full h-screen place-items-center pb-8">
      <NavBar />
      {/* Template Title */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen}>
          <DialogContent className="w-auto flex flex-col place-items-center rounded-md">
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
            <DialogFooter className="flex flex-col md:flex-row">
              <Button
                variant={templateTitle === "" ? "secondary" : "default"}
                disabled={templateTitle === "" ? true : false}
                onClick={saveTemplate}
                className="mt-2">
                Save template
              </Button>
              <Button className="mt-2 md:ml-2" onClick={closeDialog}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Upload Dialog */}
      {isUploadDialogOpen && (
        <Dialog open={isUploadDialogOpen}>
          <DialogContent className="w-auto flex flex-col place-items-center rounded-md">
            <S3UploadForm />
            <DialogFooter className="flex flex-col md:flex-row">
              <Button className="mt-2 md:ml-2" onClick={closeUploadDialog}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Accordion
        className="mt-16 w-full md:w-[60%] p-4"
        type="single"
        collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Templates</AccordionTrigger>
          <AccordionContent className="flex flex-col w-full items-center text-center p-2">
            <h2 className="font-extrabold text-xl mb-2">Templates</h2>
            <p className="text-gray-600 mb-4">
              Create your own predefined templates for your notes
            </p>
            <div className="flex flex-col md:flex-row w-full items-start justify-center">
              <div className="flex flex-col w-full md:w-[40%]  md:mr-[6.67%]">
                <h4 className="font-extrabold mb-[0.5rem]">
                  Current Templates
                </h4>
                <ScrollArea
                  className="w-full rounded-md border overflow-auto h-[10rem]"
                  type="scroll">
                  <div className="p-4">
                    {templates.map((template) => (
                      <TemplateItem
                        key={template.id}
                        template={template}
                        onDelete={deleteTemplate}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col w-full md:w-[40%] h-fit mt-6 md:mt-0">
                <Label
                  className="font-extrabold text-center"
                  htmlFor="template">
                  Define a new template
                </Label>
                <Textarea
                  className="whitespace-pre-wrap resize-y max-h-[15rem] h-[10rem] mt-2"
                  placeholder={`# Lorem Ipsum
        
Ut dolorum, repudiandae ![nomen](connecto).
        
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
                  onClick={handleSaveTemplateClick}
                  className="mt-2">
                  Save template
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="overflow-y-auto max-h-96">
          <AccordionTrigger>Media Management</AccordionTrigger>
          <AccordionContent className="w-full h-fit max-h-full">
            <FiPlusCircle
              className="cursor-pointer"
              size={30}
              onClick={addMedia}
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 place-items-center gap-2 mt-4 p-2 lg:p-4">
              {files.length > 0 ? (
                files.map((file) => (
                  <MediaCard key={file.key} file={file} deleteMedia={deleteMedia} />
                ))
              ) : (
                <p className="font-italic text-xl text-amber-600">
                  {noFilesMessage}
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* bottom buttons */}
      <div className="flex-grow"></div>
      <div className="flex">
        <Button className="mr-2 w-[9rem]" onClick={routeHome}>
          <Home size={15} />
          <span className="ml-2">Home</span>
        </Button>
        <Button className="ml-2 w-[12rem]" onClick={handleDownloadHtmlPress}>
          <ArrowDownFromLine size={15} />
          <span className="ml-2">Download HTML</span>
        </Button>
      </div>
      <Button
        className="mr-2 w-[9rem] mt-4 mb-8"
        variant={"destructive"}
        disabled={true}>
        <span className="ml-2">Delete account</span>
      </Button>
    </main>
  );
};

export default UserSettings;
