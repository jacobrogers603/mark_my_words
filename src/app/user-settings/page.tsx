"use client";
import NavBar from "@/components/NavBar";
import { Template } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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
import { ArrowDownFromLine, ArrowLeft, Home, PencilRuler } from "lucide-react";
import TemplateItem from "@/components/TemplateItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FiPlusCircle } from "react-icons/fi";
import MediaCard from "@/components/MediaCard";
import JSZip from "jszip";
import UploadForm from "@/components/UploadForm";
import { set } from "react-hook-form";
interface FileDetails {
  key: string;
  blob: Blob;
  lastModified: Date;
}

interface User {
  id: string;
  email: string;
  username: string;
}

const UserSettings = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [noFilesMessage, setNoFilesMessage] = useState<string>("");

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("redirected");
      redirect("/api/auth/signin");
    },
  });

  const getUser = async () => {
    setFilesLoading(true);
    try {
      const response = await axios.get("/api/getCurrentUsername");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const response = await axios.get("/api/getTemplates");

    if (response.data) {
      setTemplates(response.data);
    }
  };

  const saveTemplate = async () => {
    await axios.post("/api/saveTemplate", {
      title: templateTitle,
      content: templateContent,
    });
    setIsDialogOpen(false);
    fetchTemplates();
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

    fetchTemplates();
  };

  const routeHome = () => {
    router.push("/");
  };

  const routeBack = () => {
    router.back();
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

  const deleteMedia = async (key: string) => {
    if (!currentUser) {
      console.error("No user logged in.");
      return;
    }
    try {
      if (files.length === 1) {
        setNoFilesMessage("No images");
      }
      const response = await axios.delete(
        `/api/deleteMedia/${currentUser.id}/${key}`
      );
      if (response.status === 200) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.key !== key));
      } else {
        console.error("Failed to delete media:", response.data.error);
      }
    } catch (error) {
      console.log("Failed to delete media:", error);
    }
  };

  const addMedia = () => {
    setIsUploadDialogOpen(true);
  };

  const fetchAndUnzipMedia = async (): Promise<void> => {
    if (!currentUser) {
      getUser();
    }
    try {
      setFilesLoading(true);
      setNoFilesMessage("Images loading...");
      const response: AxiosResponse<Blob> = await axios.get<Blob>(
        `/api/getMedia/${currentUser?.id}`,
        {
          responseType: "blob",
        }
      );

      if (response.headers["content-type"] === "application/json") {
        setFilesLoading(false);
        setNoFilesMessage("No images");
        return;
      }

      handleUnzip(response.data);
    } catch (error) {
      setNoFilesMessage("Failed to load images");
      console.error("Error downloading or unzipping files:", error);
    }
  };

  const handleUnzip = async (fileBlob: Blob): Promise<void> => {
    const zip = new JSZip();
    try {
      const content = await zip.loadAsync(fileBlob); // Load the zip Blob
      const filesArray: FileDetails[] = [];

      for (const filename of Object.keys(content.files)) {
        const file = content.files[filename];
        if (!file.dir) {
          const blob: Blob = await file.async("blob");
          const dateCreated = extractFileID(filename); // The ID is the original date.now when the file was uploaded
          filesArray.push({
            key: filename,
            blob: blob,
            lastModified: dateCreated,
          });
        }
      }

      setFiles(filesArray);
      setFilesLoading(false);
      setNoFilesMessage("No images");
    } catch (error) {
      console.error("Error unzipping the file:", error);
    }
  };

  const extractFileID = (filename: string): Date => {
    const match = filename.match(/-id=(\d+)/);
    return match ? new Date(parseInt(match[1], 10)) : new Date();
  };

  const refreshFiles = async () => {
    fetchAndUnzipMedia();
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTemplates();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchAndUnzipMedia();
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
      <NavBar
        routeHomeProvided={false}
        userProvided={true}
        userProp={currentUser}
      />
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
            <UploadForm onUploadComplete={refreshFiles} />
            <DialogFooter className="flex flex-col md:flex-row">
              <Button
                className="mt-2 md:ml-2"
                onClick={() => {
                  closeUploadDialog();
                  refreshFiles();
                }}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Title */}
      <h1 className="mt-[6.5rem] font-semibold text-2xl p-2 border-2 border-black rounded-md">
        User-Settings
      </h1>

      {/* Back Button */}
      <Button className="mt-12 w-[9rem]" onClick={routeBack}>
        <ArrowLeft size={15} />
        <span className="ml-2">Back</span>
      </Button>

      <Accordion
        className="mt-4 w-full md:w-[60%] p-4"
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
                  <MediaCard
                    key={file.key}
                    file={file}
                    deleteMedia={deleteMedia}
                    editor={false}
                  />
                ))
              ) : (
                <p className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400 col-span-3">
                  {noFilesMessage}
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Account Management & Other</AccordionTrigger>
          <AccordionContent className="flex flex-col w-full items-center p-2">
            <div className="flex">
              <Button
                className="ml-2 w-[12rem]"
                onClick={handleDownloadHtmlPress}>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex-grow"></div>
    </main>
  );
};

export default UserSettings;
