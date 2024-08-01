import { encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { inputCode } = await req.json();

    if (!inputCode || inputCode.length !== 4 || inputCode.includes(" ")) {
      return NextResponse.json(
        { message: "Invalid input, badly formatted code" },
        { status: 400 }
      );
    }

    const encryptedInputCode = encrypt(inputCode, true);

    const matchingResetCode = await prismadb.resetCode.findUnique({
      where: {
        resetCode: encryptedInputCode,
      },
    });

    if (!matchingResetCode) {
      return NextResponse.json({ message: "Invalid code" }, { status: 404 });
    }

    if (matchingResetCode.expires < new Date()) {
      return NextResponse.json({ message: "Code expired" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Code is valid", resetCode: matchingResetCode },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "error occurred", error },
      { status: 500 }
    );
  }
}
