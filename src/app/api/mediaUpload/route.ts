import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import prismadb from "@/lib/prismadb";
import fs from "fs";
import path from "path";
import { blobToBuffer } from "@/lib/blobToBuffer";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file found" }), {
      status: 400,
    });
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const user = await prismadb.user.findUnique({
    where: { email: session?.user?.email || "" },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  try {
    const uploadDir = path.join("./public/uploads/", user.id);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = await blobToBuffer(file);
    const id = Date.now();
    const name = file.name.slice(0, file.name.lastIndexOf("."));
    const extension = file.name.slice(file.name.lastIndexOf("."));
    const formattedName = `${name}-id=${id}${extension}`;

    const filePath = path.join(uploadDir, formattedName);

    fs.writeFileSync(filePath, buffer);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({
      error,
    });
  }
};

