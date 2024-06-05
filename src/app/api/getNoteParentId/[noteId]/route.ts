import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const id = params.noteId;
  if (!id) {
    return NextResponse.json({ error: "No note id provided" });
  }

  try {
    const note = await prismadb.note.findUnique({
      where: {
        id: id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "No such note found" });
    }

    return NextResponse.json(note.parentId);
  } catch (error) {
    return NextResponse.json(error);
  }
}
