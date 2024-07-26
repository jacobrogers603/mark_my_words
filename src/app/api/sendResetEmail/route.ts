import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  host: "smtp.aol.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const POST = async (req: Request) => {
  const { email, resetCode } = await req.json();

  const message = `Greetings from Mark My Words! 
    You have requested a password reset. 
    
    Your reset code is: 
    ${resetCode}
    
    Go to: https://mark-my-words.net/reset to enter the code and reset your password.
    
    If you did not request a password reset, please ignore this email.
    
    Best regards,
    Mark My Words Creator,
    Jacob Rogers`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Mark My Words: Password Reset Code",
      text: message,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
