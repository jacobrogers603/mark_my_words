import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  const email = params.email;

  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  try {
    const user = await prismadb.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    const response = user.id;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
