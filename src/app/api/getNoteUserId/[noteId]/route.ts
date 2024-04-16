import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import authOptions from "../../../../../auth";
import { getServerSession } from "next-auth";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const session = await getServerSession(authOptions);

  if (session) {
    const id = params.noteId;

    if (typeof id !== "string") {
      throw new Error("Invalid id");
    }
    if (!id) {
      throw new Error("Invalid id");
    }

    const user = await prismadb.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
    });

    if (!user) {
      console.log("user not found");
      return NextResponse.json({ error: "User not found" });
    }

    const userId = user.id;

    if (!userId) {
      throw new Error("Invalid userId");
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
}
