import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import AWS from "aws-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY ?? "",
  },
});

async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  folderName: string
) {
  const fileBuffer = file;
  let contentType = "application/octet-stream";

  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    contentType = "image/jpg";
  } else if (fileName.endsWith(".png")) {
    contentType = "image/png";
  }

  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
    Key: `${folderName}/${fileName}`,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return fileName;
}

type ResponseData = {
  signedRequest?: string;
  url?: string;
  error?: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
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

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file found" }), {
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedFileName = await uploadFileToS3(buffer, file.name, user.id);

    return new Response(
      JSON.stringify({
        message: "File uploaded correctly.",
        fileName: uploadedFileName,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while uploading the file.",
        error,
      }),
      { status: 500 }
    );
  }
};
