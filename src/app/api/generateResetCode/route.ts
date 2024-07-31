import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
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

    // Check if the user has a reset code already, if so delete them
    const existingResetCode = await prismadb.resetCode.findMany({
      where: { userId: userId },
    });

    if (existingResetCode.length > 0) {
      await prismadb.resetCode.deleteMany({
        where: { userId: userId },
      });
    }

    // Generate a new reset code
    let isUnique: boolean = false;
    let code: number = 0;
    let encryptedCode: string = "";

    do {
      code = Math.floor(1000 + Math.random() * 9000);
      encryptedCode = encrypt(code.toString(), true);
      const resetCodeExists = await prismadb.resetCode.findFirst({
        where: { resetCode: encryptedCode },
      });

      isUnique = !resetCodeExists;
    } while (!isUnique);

    const resetCode = await prismadb.resetCode.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
        resetCode: encryptedCode,
      },
    });

    return NextResponse.json({ resetCode }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
