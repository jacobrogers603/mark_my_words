import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import { encrypt } from "@/lib/encryption";
export const dynamic = "force-dynamic";

export const POST = async (req: Request) => {
  try {
    const { noteId, newTitle } = await req.json();

    if (!noteId || !newTitle) {
      return NextResponse.json(
        { error: "ID and new title is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (session) {
      try {
        const user = await prismadb.user.findUnique({
          where: {
            email: session?.user?.email || "",
          },
        });

        if (!user) {
          console.log("user not found");
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        const note = await prismadb.note.findUnique({
          where: {
            id: noteId,
          },
        });

        if (!note) {
          return NextResponse.json(
            { error: "Note not found" },
            { status: 404 }
          );
        }

        if (note.userId !== user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const encryptedTitle = encrypt(newTitle, true);

        if (!encryptedTitle) {
          return NextResponse.json({ error: "Encryption failed" });
        }

        const updatedNote = await prismadb.note.update({
          where: {
            id: noteId,
          },
          data: {
            title: encryptedTitle,
          },
        });

        return NextResponse.json(
          { message: "Note title updated" },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(error);
      }
    } else {
      // Handle the case where there is no session
      console.log("no session");
      return new Response(null, { status: 401 }); // 401 Unauthorized
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
