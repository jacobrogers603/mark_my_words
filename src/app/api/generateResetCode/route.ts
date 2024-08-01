import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/encryption";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
export const dynamic = "force-dynamic";

// Sending back a 200 code every time for security reasons
export const POST = async (req: Request) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "route executed" }, { status: 200 });
    }

    const user = await prismadb.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json({ message: "route executed" }, { status: 200 });
    }

    // Check if the user has a reset code already, if so delete them
    const existingResetCode = await prismadb.resetCode.findMany({
      where: { userId: user.id },
    });

    if (existingResetCode.length > 0) {
      await prismadb.resetCode.deleteMany({
        where: { userId: user.id },
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
        isUsed: false,
        createdAt: new Date(),
      },
    });

    if (!resetCode) {
      return NextResponse.json({ message: "route executed" }, { status: 200 });
    }

    // Send the email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const decryptedCode = decrypt(resetCode.resetCode, true);

    await resend.emails.send({
      from: "noreply@mark-my-words.net",
      to: [email],
      subject: "Mark My Words Password Reset",
      react: EmailTemplate({ userName: user.username, resetCode: decryptedCode }),
    });

    return NextResponse.json({ message: "route executed" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error", error },  { status: 500 });
  }
};
