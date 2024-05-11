import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { forEach } from "jszip";
import { decrypt } from "@/lib/encryption";
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

      if (!currentDir) {
        return NextResponse.json("No current directory found");
      }

      // Get all the children notes of that directory, excluding the public directory.
      let currentDirNotes = await prismadb.note.findMany({
        where: {
          id: {
            in: currentDir?.childrenIds,
          },
        },
      });

      if (!currentDirNotes) return NextResponse.json([]);

      // Filter out the public directory.
      currentDirNotes = currentDirNotes.filter((note) => {
        const decryptedTitle = decrypt(note.title, true);
        return decryptedTitle !== user?.username;
      });

      let response: { title: string; id: string; isDirectory: boolean }[] = [];

      for (const note of currentDirNotes) {
        const decryptedTitle = decrypt(note.title, true);

        response.push({
          title: decryptedTitle,
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
