import { NextResponse } from "next/server";
import authOptions from "../../../../auth";
import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {  
  const session = await getServerSession(authOptions);

  // Check if the user is not signed in
  if (!session?.user?.email) {
    const response = {
      id: "unauthenticated",
      email: "unauthenticated",
      username: "unauthenticated",
    }
    return NextResponse.json(response);
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

  // Return the currentUser's email and username in JSON format
  const response = {
    id: currentUser.id,
    email: currentUser.email,
    username: currentUser.username,
  };

  return NextResponse.json(response);
}
