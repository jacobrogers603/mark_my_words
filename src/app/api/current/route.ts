import { NextResponse } from "next/server";
import authOptions from "../../../../auth";
import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // Check if the user is not signed in
  if (!session?.user?.email) {
    return new Response("Not signed in", { status: 401 }); // Return a 401 Unauthorized response
  }

  const currentUser = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  // Check if currentUser is not found
  if (!currentUser) {
    return new Response("User not found", { status: 404 }); // Return a 404 Not Found response
  }

  // Return the currentUser in JSON format
  return NextResponse.json(currentUser);
}
