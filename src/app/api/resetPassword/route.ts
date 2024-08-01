import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { userId, newPassword, resetCodeId } = await req.json();

    if (!userId || !newPassword || !resetCodeId) {
      return NextResponse.json(
        { message: "Missing Information" },
        { status: 400 }
      );
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const resetCode = await prismadb.resetCode.findUnique({
      where: {
        id: resetCodeId,
      },
    });

    if (!resetCode) {
      return NextResponse.json({ message: "Invalid reset code" }, { status: 404 });
    }

    if(resetCode.expires < new Date()){
        return NextResponse.json({ message: "Reset code expired" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prismadb.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword: hashedNewPassword,
      },
    });

    await prismadb.resetCode.delete({
      where: {
        id: resetCodeId,
      },
    });

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    return NextResponse.json(
      { message: "error occurred", error },
      { status: 500 }
    );
  }
}
