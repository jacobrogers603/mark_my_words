import JSZip, { forEach } from "jszip";
import * as fs from "fs";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import { Note } from "@prisma/client";

export const GET = async (req: Request) => {
  try {
    const { id } = await req.json();
    const session = await getServerSession(authOptions);

    if (session) {
      try {
        const user = await prismadb.user.findUnique({
          where: {
            email: session?.user?.email || "",
          },
        });

        if (!user) {
          console.log("user not found");
          return NextResponse.json({ error: "User not found" });
        }

        // Create a new instance of JSZip
        const zip = new JSZip();

        // Get the base directory
        const note = await prismadb.note.findUnique({
          where: {
            id: id,
          },
        });

        if (!note) {
          return NextResponse.json({ error: "Note not found" });
        }

        if (!note.isDirectory) {
          return NextResponse.json({ error: "Note is not a directory" });
        }

        const zipDirectory = async (directory: Note) => {
          const folder = zip.folder(directory.title);

          if (!folder) {
            return NextResponse.json({ error: "Failed to create folder" });
          }

          for (var i = 0; i < directory.childrenIds.length; i++) {
            const child = await prismadb.note.findUnique({
              where: {
                id: directory.childrenIds[i],
              },
            });

            if (!child) {
              return NextResponse.json({ error: "Child note not found" });
            }

            if (!child.isDirectory) {
              const content = child.content;
              if (!content) {
                return NextResponse.json({ error: "Content not found" });
              }

              folder.file(child.title, content);
            } else if (child.isDirectory) {
              await zipDirectory(child);
            }
          }
        };

        await zipDirectory(note);

        
      } catch (error) {
        return NextResponse.json(error);
      }
    } else {
      // Handle the case where there is no session
      console.log("no session");
      return new Response(null, { status: 401 }); // 401 Unauthorized
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
