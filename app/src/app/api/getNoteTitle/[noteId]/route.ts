import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import authOptions from "../../../../../auth";
import { getServerSession } from "next-auth";
import { decrypt } from "@/lib/encryption";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const id = params.noteId;
  const session = await getServerSession(authOptions);

  if (session) {
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

    try {
      let note =
        id === "root"
          ? await prismadb.note.findFirst({
              where: {
                title: user.email,
              },
            })
          : await prismadb.note.findUnique({
              where: {
                id: id,
              },
            });

      if (!note) {
        throw new Error("No Such Note Found");
      }

      if(note.title){
        note.title = decrypt(note.title, true);
      }

      return NextResponse.json(note.title);
    } catch (error) {
      return NextResponse.json(error);
    }
  } else {
    // Public viewer.
    try {
      let note = await prismadb.note.findUnique({
        where: {
          id: id,
        },
      });

      if (!note) {
        throw new Error("No Such Note Found");
      }

      if(note.title){
        note.title = decrypt(note.title, true);
      }

      return NextResponse.json(note.title);
    } catch (error) {
      return NextResponse.json(error);
    }
  }
}
