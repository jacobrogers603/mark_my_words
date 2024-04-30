import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(
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
    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
