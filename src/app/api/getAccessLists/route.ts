import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const GET = async (req: Request) => {
  try {
    const { noteId } = await req.json();

    if (!noteId) {
      return NextResponse.json({ error: "Invalid input, missing information" });
    }

    const session = await getServerSession(authOptions);

    if (session) {
      try {
        const note = await prismadb.note.findUnique({
          where: {
            id: noteId,
          },
        });

        if (!note) {
          console.log("note not found");
          return NextResponse.json({ error: "Note not found" });
        }

        const responseBundle = {
          readAccessList: note.readAccessList,
          writeAccessList: note.writeAccessList,
        };

        return NextResponse.json(responseBundle);
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
