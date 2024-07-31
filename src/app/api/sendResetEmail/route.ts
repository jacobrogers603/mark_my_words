import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

export const POST = async (req: Request) => {
  try {
    const { email, resetCode } = await req.json();

    if (!email || !resetCode) {
      return NextResponse.json(
        { error: "Missing email or reset code" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "noreply@mark-my-words.net",
      to: [email],
      subject: "Mark My Words Password Reset",
      react: EmailTemplate({ email, resetCode }),
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
