import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import AWS from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();

type ResponseData = {
  signedRequest?: string;
  url?: string;
  error?: string;
};

export const POST = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const { fileType, fileName, userId } = req.body as {
    fileType: string;
    fileName: string;
    userId: string;
  };

  if (!fileType || !fileName || !userId) {
    return res
      .status(400)
      .json({ error: "Missing fileType or fileName or userId" });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return res.status(401).json({ error: "No session" });
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

  const s3Params = {
    Bucket: "your_bucket_name",
    Key: `users/${userId}/images/${fileName}`, // User-specific path
    Expires: 300,
    ContentType: fileType,
    ACL: "public-read",
  };

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error creating pre-signed URL" });
    }
    res.status(200).json({
      signedRequest: data,
      url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
    });
  });
};
