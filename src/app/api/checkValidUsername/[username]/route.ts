import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  if (!username) {
    throw new Error("No username provided");
  }

  try {
    const serverUsername = await prismadb.user.findUnique({
      where: {
        username,
      },
    });

    if (!serverUsername) {
      return NextResponse.json({ valid: false });
    } else if (serverUsername) {
      return NextResponse.json({ valid: true });
    }
  } catch (error) {
    return NextResponse.json(error);
  }
}
