import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import authOptions from "../../../../auth";
// import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import prismadb from "@/lib/prismadb";

// const s3Client = new S3Client({
//   region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
//   credentials: {
//     accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID ?? "",
//     secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY ?? "",
//   },
// });

// export const DELETE = async (
//   req: NextRequest
// ) => {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }

//     const user = await prismadb.user.findUnique({
//       where: {
//         email: session?.user?.email || "",
//       },
//     });

//     if (!user) {
//       return new Response(JSON.stringify({ error: "User not found" }), {
//         status: 404,
//       });
//     }

//     const key = await req.json();

//     console.log("Deleting file with key:", key);

//     if (!key) {
//       return new Response(JSON.stringify({ error: "No file key provided" }), {
//         status: 400,
//       });
//     }

//     const deleteParams = {
//       Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
//       Key: key.key,
//     };

//     const command = new DeleteObjectCommand(deleteParams);
//     await s3Client.send(command);

//     return new Response(
//       JSON.stringify({ message: "File deleted successfully" }),
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     console.error("Error deleting file:", error);
//     return new Response(JSON.stringify({ error: "Failed to delete the file", }), {
//       status: 500,
//     });
//   }
// };

export const DELETE = async (req: NextRequest) => {
  return NextResponse.json({ message: "Under construction" });
};
