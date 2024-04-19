import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Return the public dir for a user based on their username.
export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  if (!username) {
    return NextResponse.json("No username given");
  }

  try {
    const publicDir = await prismadb.note.findFirst({
      where: {
        title: username,
      },
    });

    if (!publicDir) {
      return NextResponse.json("No public dir can be found");
    }

    const publicDirId = publicDir.id;

    return NextResponse.json(publicDirId);
  } catch (error) {
    return NextResponse.json(error);
  }
}
