import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const POST = async (req: Request) => {
  try {
    const { title, content, isDirectory } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" });
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

        const userId = user?.id;

        const newNote = await prismadb.note.create({
            data: {
                title,
                content,
                isDirectory,
                userId: userId || "", // Ensure userId is of type string
            },
        });

        const updatedUser = await prismadb.user.update({
            where: {
                id: userId,
            },
            data: {
                noteIDs: {
                    push: newNote.id,
                }
            },
        });        

        return NextResponse.json(newNote);
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
