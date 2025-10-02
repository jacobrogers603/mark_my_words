import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import { Prisma,  } from "@prisma/client";

export const DELETE = async (req: Request) => {
  try {
    const { noteId, targetEmail } = await req.json();

    if (!noteId || !targetEmail) {
      return NextResponse.json({ error: "Invalid input, missing information" });
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
          return NextResponse.json({ error: "User not found" });
        }

        const note = await prismadb.note.findUnique({
          where: {
            id: noteId,
          },
        });

        if (!note) {
          console.log("note not found");
          return NextResponse.json({ error: "Note not found" });
        }
        
        const updatedWriteAccessList = note.writeAccessList.filter((email) => email !== targetEmail);
        const updatedReadAccessList = note.readAccessList.filter((email) => email !== targetEmail);

        const updatedNote = await prismadb.note.update({
            where: {
                id: noteId,
            },
            data: {
                writeAccessList: {
                    set: updatedWriteAccessList
                },
                readAccessList: {
                    set: updatedReadAccessList
                }
            },
        });

        return NextResponse.json(note);
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
