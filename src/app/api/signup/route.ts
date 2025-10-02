import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { generateUsername } from "@/lib/animalsAndAdjectives";
import { encrypt } from "@/lib/encryption";
export const dynamic = "force-dynamic";
import path from "path";
import fs from "fs";

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered :(" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const username = await generateUsername();
    if (!username) {
      return NextResponse.json({ error: "Username generation failed" });
    }

    const user = await prismadb.user.create({
      data: {
        email,
        username,
        hashedPassword,
      },
    });

    const encryptedRootTitle = encrypt(email, true);

    const rootDir = await prismadb.note.create({
      data: {
        title: encryptedRootTitle,
        content: "",
        isDirectory: true,
        userId: user.id || "",
        readAccessList: [email],
      },
    });

    const encryptedPublicTitle = encrypt(username, true);
    const readAccessList = [email, "public"];

    const publicDir = await prismadb.note.create({
      data: {
        title: encryptedPublicTitle,
        content: "",
        isDirectory: true,
        userId: user.id || "",
        parentId: rootDir.id,
        readAccessList: readAccessList,
      },
    });

    const updatedRootDir = await prismadb.note.update({
      where: {
        id: rootDir.id,
      },
      data: {
        childrenIds: {
          push: publicDir.id,
        },
      },
    });

    const updatedUser = await prismadb.user.update({
      where: {
        id: user.id,
      },
      data: {
        noteIDs: {
          push: [rootDir.id, publicDir.id],
        },  
        currentPath: {
          push: rootDir.id,
        },
      },
    });

    // Create the user's upload directory
    const uploadDir = path.join("./public/uploads/", user.id);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
