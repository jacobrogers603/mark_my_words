import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios";

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
    // Check if the user has read access to the note that contains the image
    const currentUser = await axios.get("/api/getCurrentUsername");

    if (!currentUser || !currentUser.data.email) {
      return NextResponse.json({ error: "could not get current username" });
    }

    const currentUserEmail = currentUser.data.email;

    const accessLists = await axios.post(
      `/api/getAccessLists/${callingNoteId}`
    );

    if (!accessLists || !accessLists.data.readAccessList) {
      return NextResponse.json({ error: "could not get access lists" });
    }

    if (
      !(
        accessLists.data.readAccessList.includes("public") ||
        accessLists.data.readAccessList.includes(currentUserEmail)
      )
    ) {
      return NextResponse.json({
        error:
          "User does not have read access to the note, and thus the image.",
      });
    }

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
    return NextResponse.json({ error });
  }
}
