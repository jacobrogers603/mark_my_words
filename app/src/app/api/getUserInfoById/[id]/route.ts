import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

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

    const response = {
      id: user.id,
      email: user.email,
      username: user.username,
    };


    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
