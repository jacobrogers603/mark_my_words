import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import { decrypt } from "@/lib/encryption";
export const dynamic = 'force-dynamic';

export const GET = async (req: Request) => {
  try {
    const { id } = await req.json();
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

        let template = await prismadb.template.findUnique({
          where: {
            id: id,
          },
        });

        if (!template) {
          throw new Error("No Such Template Found");
        }

        if(template.title){
          template.title = decrypt(template.title, true);
        }

        if(template.content){
          template.content = decrypt(template.content, false);
        }

        return NextResponse.json(template);
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
