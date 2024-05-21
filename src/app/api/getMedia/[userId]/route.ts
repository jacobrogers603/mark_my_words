import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import JSZip from "jszip";
import path from "path";
import { getServerSession } from "next-auth";
import authOptions from "../../../../../auth";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing userID" });
  }

  const session = await getServerSession(authOptions);

  if(!session) {
    return NextResponse.json({ error: "No session found" });
  }

  // Make sure the user that is logged in is the same one from the userId that was passed in
  const response = await axios.get("/api/getCurrentUsername");

  if(!response.data || !response) {
    return NextResponse.json({ error: "No user found" });
  }

  if(response.data.id !== userId) {
    return NextResponse.json({ error: "User does not have permission to download this media" });
  }

  try {
    const uploadDir = path.join("./public/uploads", userId);

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json(
        {
          Message: "No upload directory found for this userId",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const files = fs.readdirSync(uploadDir);
    const zip = new JSZip();

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);
      const data = fs.readFileSync(filePath);
      zip.file(file, data);
    });

    const content = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(content, {
      headers: {
        "Content-Disposition": `attachment; filename="${userId}_media.zip"`,
        "Content-Type": "application/zip",
      },
    });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
