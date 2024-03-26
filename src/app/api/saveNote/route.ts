import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const POST = async (req: Request) => {
  try {
    const { id, title, content, isDirectory } = await req.json();

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

        if (user.email === title) {
          return NextResponse.json({
            error:
              "Title cannot be the same as email, this is reserved for the root note!",
          });
        }

        const userId = user?.id;

        if (id) {
          // Update an existing note
          const updatedNote = await prismadb.note.update({
            where: {
              id: id,
            },
            data: {
              title,
              content,
              isDirectory,
            },
          });

          return NextResponse.json(updatedNote);
        } else {
          // Create a new note
          const newNote = await prismadb.note.create({
            data: {
              title,
              content,
              isDirectory,
              userId: userId || "", // Ensure userId is of type string
            },
          });

          // Update the parent directory's child array to contain this note.
          const currentDirectoryId =
            user?.currentPath[user?.currentPath.length - 1];
          const updatedDirectory = await prismadb.note.update({
            where: {
              id: currentDirectoryId ?? undefined,
            },
            data: {
              childrenIds: {
                push: newNote.id,
              },
            },
          });

          // Update the user's noteIDs array to contain the new note.
          const updatedUser = await prismadb.user.update({
            where: {
              id: userId,
            },
            data: {
              noteIDs: {
                push: newNote.id,
              },
            },
          });

          return NextResponse.json(newNote);
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

export const DELETE = async (req: Request) => {
  try {
    const { noteId } = await req.json();

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

        // Delete the note
        const note = await prismadb.note.findUnique({
          where: {
            id: noteId,
          },
        });

        if(!note) {
          return NextResponse.json({ error: "Note not found" });
        }

        if(note.title === user.email) {
          return NextResponse.json({ error: "Cannot delete the root note!" });
        }

        const deletedNote = await prismadb.note.delete({
          where: {
            id: noteId,
          },
        });

        // Update the parent directory's child array to no longer contain this note.
        const currentDirectoryId =
          user?.currentPath[user?.currentPath.length - 1];
        const updatedDirectory = await prismadb.note.update({
          where: {
            id: currentDirectoryId,
          },
          data: {
            childrenIds: {
              set: (
                await prismadb.note.findUnique({
                  where: { id: currentDirectoryId },
                })
              )?.childrenIds.filter((id) => id !== noteId),
            },
          },
        });

        // Update the user's noteIDs array to no longer contain this note.
        const updatedUser = await prismadb.user.update({
          where: {
            id: user.id,
          },
          data: {
            noteIDs: {
              set: (
                await prismadb.user.findUnique({
                  where: { id: user.id },
                })
              )?.noteIDs.filter((id) => id !== noteId),
            },
          },
        });
      } catch (error) {
        console.log(error);
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
