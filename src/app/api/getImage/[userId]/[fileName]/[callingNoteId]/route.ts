import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import authOptions from "../../../../../../../auth";

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: { userId: string; fileName: string; callingNoteId: string } }
) {
  const userId = params.userId;
  const fileName = params.fileName;
  const callingNoteId = params.callingNoteId;

  if (!userId || !fileName || !callingNoteId) {
    return NextResponse.json({
      error: "Missing userID or fileName or callingNoteId",
    });
  }

  try {
    // Check if the callingNote has the requested image in its imageIds list
    const callingNote = await prismadb.note.findUnique({
      where: {
        id: callingNoteId,
      },
    });

    if (!callingNote) {
      return NextResponse.json({ error: "Note not found" });
    }

    const image = await prismadb.image.findFirst({
      where: {
        fileName: fileName,
      },
    });

    if (!image || !image.id) {
      return NextResponse.json({ error: "Image not found" });
    }

    if (!callingNote?.imageIds.includes(image.id)) {
      return NextResponse.json({
        error: "Note does not contain the requested image",
      });
    }

    // If the note is not public, check if the current user has read access to the note that contains the image
    if (!callingNote.readAccessList.includes("public")) {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "No session found" });
      }

      const currentUser = await prismadb.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" });
      }

      if (!callingNote.readAccessList) {
        return NextResponse.json({ error: "could not get read access list" });
      }

      if (!callingNote.readAccessList.includes(currentUser.email)) {
        return NextResponse.json({
          error:
            "User does not have read access to the note, and thus the image.",
        });
      }
    }

    // If we passed all the checks, get the image file and return it

    const filePath = path.join("./public/uploads", userId, fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "No file found" });
    }

    const data = fs.readFileSync(filePath);

    return new NextResponse(data, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}
