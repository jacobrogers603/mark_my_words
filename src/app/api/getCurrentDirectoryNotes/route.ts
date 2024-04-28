import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { forEach } from "jszip";
export const dynamic = "force-dynamic";

// Return the titles and ids from the notes of a directory.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session) {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          email: session?.user?.email || "",
        },
      });

      // Find the current directory.
      const currentDirId = user?.currentPath[user?.currentPath.length - 1];

      const currentDir = await prismadb.note.findUnique({
        where: {
          id: currentDirId,
        },
      });

      // Get all the children notes of that directory, excluding the public directory.
      const currentDirNotes = await prismadb.note.findMany({
        where: {
          id: {
            in: currentDir?.childrenIds,
          },
          title: {
            not: user?.username,
          },
        },
      });

      if(!currentDirNotes) return NextResponse.json([]);

      let response: { title: string, id: string, isDirectory: boolean }[] = [];

      for (const note of currentDirNotes) {
        response.push({
          title: note.title,
          id: note.id,
          isDirectory: note.isDirectory,
        });
      }

      return NextResponse.json(response);
    } catch (error) {
      return NextResponse.json(error);
    }
  } else {
    return new Response(null, { status: 401 });
  }
}
