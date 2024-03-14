import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

// Return a note from the server based on its id
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (session) {

    const noteID = (req as any).query.noteID;
    
    console.log("Note ID", noteID);
    try {
      const note = await prismadb.note.findUnique({
        where: {
          id: noteID,
        },
      });

      if (!note) {
        console.log("Note not found");
        return NextResponse.json({ error: "Note not found" });
      }

      return NextResponse.json(note);
    } catch (error) {
      return NextResponse.json(error);
    }
  } else {
    return new Response(null, { status: 401 });
  }
}
