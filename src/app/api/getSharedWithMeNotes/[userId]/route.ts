// "use server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import authOptions from "../../../../../auth";
import { getServerSession } from "next-auth";
import { decrypt } from "@/lib/encryption";
export const dynamic = "force-dynamic";

interface Note {
  title: string;
  id: string;
  noteCreator: User;
  readAccessList: string[];
  writeAccessList: string[];
}

interface User {
  id: string;
  email: string;
  username: string;
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: "No user ID provided" });
  }

  const session = await getServerSession(authOptions);

  try {
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No user found" });
    }

    if (!session || session?.user?.email !== user.email) {
      return NextResponse.json({ error: "No session found or access denied" });
    }

    const notesWithReadAccessForUser = await prismadb.note.findMany({
      where: {
        readAccessList: {
          has: user.email,
        },
      },
    });

    // Notes shared with the user but not created by the user, the creator of the note is the first element in the readAccessList
    let sharedWithMeNotes = notesWithReadAccessForUser.filter(
      (note) => note.readAccessList[0] !== user.email
    );

    // Return a note object that contains the userEmail, aka the creator of the note in email form
    let sharedWithMeNotesResponse: Note[] = [];

    sharedWithMeNotes.forEach((note) => {
      let creator: User = {
        id: note.userId,
        email: note.readAccessList[0],
        username: "unknown username",
      };
      sharedWithMeNotesResponse.push({
        title: decrypt(note.title, true),
        id: note.id,
        noteCreator: creator,
        readAccessList: note.readAccessList,
        writeAccessList: note.writeAccessList,
      });
    });

    return NextResponse.json(sharedWithMeNotesResponse);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
