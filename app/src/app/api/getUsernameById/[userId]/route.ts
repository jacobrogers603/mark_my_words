import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import authOptions from "../../../../../auth";
import { getServerSession } from "next-auth";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: "No user ID provided" });
  }

  try {
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No user found" });
    }

    const username = user.username;

    return NextResponse.json({ username });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
