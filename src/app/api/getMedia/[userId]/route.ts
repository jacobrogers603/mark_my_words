import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import JSZip from "jszip";
import path from "path";
import { getServerSession } from "next-auth";
import authOptions from "../../../../../auth";
import prismadb from "@/lib/prismadb";
import { decryptPhoto } from "@/lib/mediaEncryption";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing userID" });
  }

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

  if (currentUser.id !== userId) {
    return NextResponse.json({
      error: "User does not have permission to download this media",
    });
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

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const encrypted = fs.readFileSync(filePath, 'utf8');
      try {
        const data = decryptPhoto(encrypted);
        zip.file(file, data);
      } catch (decryptError) {
        console.error(`Error decrypting file ${file}:`, decryptError);
        return NextResponse.json({ error: `Error decrypting file ${file}: ${decryptError}` });
      }
    }

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
