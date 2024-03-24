import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";

export const POST = async (req: Request) => {
  try {
    const { directoryId } = await req.json();

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

        const userId = user?.id;

        const updatedUser = await prismadb.user.update({
            where: {
                id: userId,
            },
            data: {
                currentPath: {
                    push: directoryId,
                },
            },
        });

        return NextResponse.json(updatedUser);
      } catch (error) {
        return NextResponse.json(error);
      }
    } else {
      // Handle the case where there is no session
      console.log("no session");
      return new Response(null, { status: 401 }); // 401 Unauthorized
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};

export const DELETE = async (req: Request) => {
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

        const userId = user?.id;

        const pathLength = user.currentPath.length;
        if(pathLength <= 1) {
            return NextResponse.json({ error: "Cannot go back further" });
        }

        const updatedPath = user.currentPath.slice(0, -1);

        const updatedUser = await prismadb.user.update({
            where: {
                id: userId,
            },
            data: {
                currentPath: updatedPath
            },
        });

        return NextResponse.json(updatedUser);
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
