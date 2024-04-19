import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = params.noteId;

    if (!noteId) {
      return NextResponse.json({ error: "Invalid input, missing information" });
    }

    try {
      const note = await prismadb.note.findUnique({
        where: {
          id: noteId,
        },
      });

      if (!note) {
        console.log("note not found");
        return NextResponse.json({ error: "Note not found" });
      }

      const responseBundle = {
        readAccessList: note.readAccessList,
        writeAccessList: note.writeAccessList,
      };

      return NextResponse.json(responseBundle);
    } catch (error) {
      return NextResponse.json(error);
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
