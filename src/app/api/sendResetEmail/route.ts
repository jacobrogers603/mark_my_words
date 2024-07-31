import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { decrypt } from "@/lib/encryption";
export const dynamic = "force-dynamic";

export const POST = async (req: Request) => {
  try {
    const { email, userName, resetCode } = await req.json();

    if (!userName || !resetCode || !email) {
      return NextResponse.json(
        { error: "Missing userName or reset code or email" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const decryptedCode = decrypt(resetCode, true);

    const { data, error } = await resend.emails.send({
      from: "noreply@mark-my-words.net",
      to: [email],
      subject: "Mark My Words Password Reset",
      react: EmailTemplate({ userName, resetCode: decryptedCode }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
