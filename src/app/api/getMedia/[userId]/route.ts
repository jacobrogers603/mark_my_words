import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import JSZip from "jszip";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing userID" });
  }

  try {
    const uploadDir = path.join("./public/uploads", userId);
    
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({
        error: "No upload directory found for this userId",
      });
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
