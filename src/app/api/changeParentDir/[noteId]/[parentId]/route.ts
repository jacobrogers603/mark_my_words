import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { noteId: string; parentId: string } }
) {
  const id = params.noteId;
  const parentId = params.parentId;

  if (!id || !parentId) {
    return NextResponse.json({ error: "note id or parent id not provided" });
  }

  try {
    const note = await prismadb.note.findUnique({
      where: {
        id: id,
      },
    });

    if (!note || !note.parentId) {
      return NextResponse.json({ error: "No such note found" });
    }

    const oldParent = await prismadb.note.findUnique({
      where: {
        id: note.parentId,
      },
    });

    const newParent = await prismadb.note.findUnique({
      where: {
        id: parentId,
      },
    });

    if (!oldParent || !newParent) {
      return NextResponse.json({ error: "No such parent found" });
    }

    // update the parent id of the note
    await prismadb.note.update({
      where: {
        id: id,
      },
      data: {
        parentId: parentId,
      },
    });

    // update the childrenIds of the old parent to remove the note id
    await prismadb.note.update({
      where: {
        id: oldParent.id,
      },
      data: {
        childrenIds: {
          set: oldParent.childrenIds.filter((childId) => childId !== id),
        },
      },
    });

    // update the childrenIds of the new parent to add the note id
    await prismadb.note.update({
      where: {
        id: parentId,
      },
      data: {
        childrenIds: {
          set: [...newParent.childrenIds, id],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(error);
  }
}
