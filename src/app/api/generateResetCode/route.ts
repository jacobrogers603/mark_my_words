import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const POST = async (req: Request) => {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "UserIs is required." });
    }

    const user = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." });
    }

    
    let isUnique: boolean = false;
    let code: number = 0;

    do{
        code = Math.floor(1000 + Math.random() * 9000);
        const resetCodeExists = await prismadb.resetCode.findFirst({
            where: { resetCode : code},
        });
    
        isUnique = !resetCodeExists;
            
    }while(!isUnique);

    const resetCode = await prismadb.resetCode.create({
        data: {
            userId: user.id,
            resetCode: code,
            expires: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
        },
    });

    return NextResponse.json({ resetCode }, { status: 200 });
 
    }catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};


