import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; fileName: string } }
) {
  const userId = params.userId;
  const fileName = params.fileName;

  if (!userId || !fileName) {
    return NextResponse.json({ error: "Missing userID or fileName" });
  }

  try {
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
