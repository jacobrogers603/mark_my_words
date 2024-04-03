import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const POST = async (req: Request) => {
  try {
    const { id, title, content } = await req.json();

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

        if (id) {
          // Update an existing template
          const updatedTemplate = await prismadb.template.update({
            where: {
              id: id,
            },
            data: {
              title,
              content,
            },
          });

          return NextResponse.json(updatedTemplate);
        } else {
          // Create a new note
          const newTemplate = await prismadb.template.create({
            data: {
              title,
              content,
            },
          });

          // Update the user's templates array to contain the new template.
          const updatedUser = await prismadb.user.update({
            where: {
              id: userId,
            },
            data: {
              templateIDs: {
                push: newTemplate.id,
              },
            },
          });

          return NextResponse.json(newTemplate);
        }
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
