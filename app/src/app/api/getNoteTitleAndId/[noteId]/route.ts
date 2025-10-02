import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { decrypt } from "@/lib/encryption";
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

    const decryptedTitle = decrypt(note.title, true);

    const response = {
      title: decryptedTitle,
      id: note.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(error);
  }
}
