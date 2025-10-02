import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prismadb from "@/lib/prismadb";

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
    // Remove the representation of the image from the database first
    const image = await prismadb.image.findFirst({
      where: { fileName },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" });
    }

    await prismadb.image.delete({
      where: { id: image.id },
    });

    // Then, remove the image file from the server
    const filePath = path.join("./public/uploads", userId, fileName);
    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
