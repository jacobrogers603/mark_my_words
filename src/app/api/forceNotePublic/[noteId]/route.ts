import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import authOptions from "../../../../../auth";

export async function POST(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const id = params.noteId;
  const session = await getServerSession(authOptions);

  if (!id || !session) {
    return NextResponse.json({ error: "No note id provided or no session" });
  }

  const user = await prismadb.user.findUnique({
    where: {
      email: session?.user?.email || "",
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
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

    // make sure the user is the owner of the note
    if (note.userId !== user.id) {
      return NextResponse.json({ error: "You are not the owner of this note" });
    }

    if (note.readAccessList.includes("public")) {
      return NextResponse.json({
        success: true,
        message: "Note is already public",
      });
    }

    // make the note public
    await prismadb.note.update({
      where: {
        id: id,
      },
      data: {
        readAccessList: [...note.readAccessList, "public"],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(error);
  }
}
