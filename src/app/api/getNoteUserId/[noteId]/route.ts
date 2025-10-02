import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const id = params.noteId;

  if (typeof id !== "string") {
    throw new Error("Invalid id");
  }
  if (!id) {
    throw new Error("Invalid id");
  }

  try {
    const note = await prismadb.note.findUnique({
      where: {
        id: id,
      },
    });

    if (!note) {
      throw new Error("No Such Note Found");
    }

    const noteUserId = note.userId;

    if (!noteUserId) {
      throw new Error("Invalid noteUserId");
    }

    return NextResponse.json(noteUserId);
  } catch (error) {
    return NextResponse.json(error);
  }
}
