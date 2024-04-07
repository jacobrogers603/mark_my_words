import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const POST = async (req: Request) => {
  try {
    const { noteId, allowedEmail } = await req.json();

    if (!noteId || !allowedEmail) {
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

        if(!note.readAccessList.includes(allowedEmail)){
            return NextResponse.json({ error: "User does not have read access, they need read access to have write access." });
        }

        if(note.writeAccessList.includes(allowedEmail)){
            return NextResponse.json({ error: "User already has write access" });
        }

        const updatedNote = await prismadb.note.update({
          where: {
            id: noteId,
          },
          data: {
            writeAccessList: {
              push: allowedEmail,
            },
          },
        });

        if (!updatedNote) {
          console.log("note not found");
          return NextResponse.json({ error: "Note not found" });
        }

        return NextResponse.json(updatedNote);
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
