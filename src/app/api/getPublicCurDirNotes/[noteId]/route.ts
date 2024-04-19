import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Return the notes from a directory.
export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  console.log("Request URL:", req.url); // Log the URL to see what's being requested
  console.log("Params received:", params); // Log the parameters to see what's being passed

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

    return NextResponse.json(currentDirNotes);
  } catch (error) {
    console.error("Error fetching directory notes:", error); // Log the error
    return NextResponse.json({ error });
  }
}
