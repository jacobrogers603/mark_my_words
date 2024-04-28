import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Return the notes from a directory.
export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const noteId = params.noteId;

  if (!noteId) {
    return NextResponse.json({ error: "No directory ID given" });
  }

  try {
    const currentDir = await prismadb.note.findUnique({
      where: {
        id: noteId,
      },
    });

    // Ensure there is a current directory found and it has childrenIds
    if (!currentDir || !currentDir.childrenIds) {
      return NextResponse.json({ error: "Directory not found or no children" });
    }

    // Get all the children notes of that directory.
    const currentDirNotes = await prismadb.note.findMany({
      where: {
        id: {
          in: currentDir.childrenIds,
        },
      },
    });

    if (!currentDirNotes) return NextResponse.json([]);

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
    console.error("Error fetching directory notes:", error); // Log the error
    return NextResponse.json({ error });
  }
}
