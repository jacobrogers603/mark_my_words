import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import AWS from "aws-sdk";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new AWS.S3({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY ?? "",
  },
});

type ResponseData = {
  signedRequest?: string;
  url?: string;
  error?: string;
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { fileType, fileName, userId } = await req.json();

  const s3Params = {
    Bucket: "your_bucket_name",
    Key: `users/${userId}/images/${fileName}`, // User-specific path
    Expires: 300, // Link expiration time (in seconds)
    ContentType: fileType,
    ACL: "public-read",
  };

  if (!fileType || !fileName || !userId) {
    return NextResponse.json({ error: "Missing required fields" });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No session" });
  }

  const user = await prismadb.user.findUnique({
    where: {
      email: session?.user?.email || "",
    },
  });

  if (!user) {
    console.log("user not found");
    return NextResponse.json({ error: "User not found" });
  }

  return new Promise<Response>((resolve, reject) => {
    s3.getSignedUrl("putObject", s3Params, (err, data) => {
      if (err) {
        console.error("Error getting signed URL:", err);
        return resolve(
          new Response(
            JSON.stringify({ error: "Error creating pre-signed URL" }),
            { status: 500 }
          )
        );
      }
      const response = new Response(
        JSON.stringify({
          signedRequest: data,
          url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
      resolve(response);
    });
  });
};
