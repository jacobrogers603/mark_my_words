import { encrypt } from "@/lib/encryption";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Return a public dir's id and userId based on a username.
export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  if (!username) {
    return NextResponse.json("No username given");
  }

  const encryptedUsername = encrypt(username, true);

  try {
    const publicDir = await prismadb.note.findFirst({
      where: {
        title: encryptedUsername,
      },
    });

    if (!publicDir) {
      return NextResponse.json("No public dir can be found");
    }

    const response = {
      id: publicDir.id,
      userId: publicDir.userId,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(error);
  }
}
