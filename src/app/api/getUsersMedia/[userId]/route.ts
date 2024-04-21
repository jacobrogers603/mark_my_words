import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../../auth";
import AWS from "aws-sdk";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY ?? "",
  },
});

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
  res: Response
) {
  const userId = params.userId;

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      Prefix: `${userId}/`,
    });

    const { Contents } = await s3Client.send(command);

    if (!Contents) {
      return NextResponse.json({ error: "No files found" });
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const files = Contents.map((item) => ({
      title: item.Key?.replace(`${userId}/`, ""),
      key: item.Key,
      lastModified: formatter.format(new Date(item.LastModified ?? "")),
    }));

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
