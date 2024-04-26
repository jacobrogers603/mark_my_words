import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import prismadb from "@/lib/prismadb";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file found" }), {
      status: 400,
    });
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await prismadb.user.findUnique({
      where: { email: session?.user?.email || "" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signals the end of the stream

    const form = new FormData();
    form.append("file", stream, { filename: file.name });

    const nanodeUrl = `http://172.235.157.152:3000/upload?userId=${user.id}`; // Ensure this URL is correct and reachable

    const response = await axios.post(nanodeUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });    

    return new Response(
      JSON.stringify({
        message: "File uploaded successfully.",
        url: response.data.url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({
      error,
    });
  }
};
