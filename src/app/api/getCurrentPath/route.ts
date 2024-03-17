import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      try {
        const user = await prismadb.user.findUnique({
          where: {
            email: session?.user?.email || "",
          },
        });

        if (!user) {
          console.log("user not found");
          return NextResponse.json({ error: "User not found" });
        }

        const currentPath = user?.currentPath;

        if (!currentPath) {
          console.log("currentPath not found");
          return NextResponse.json({ error: "Current path not found" });
        }

        return NextResponse.json(currentPath);
      } catch (error) {
        return NextResponse.json(error);
      }
    } else {
      console.log("no session");
      return new Response(null, { status: 401 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
