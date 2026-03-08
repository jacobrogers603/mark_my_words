import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
export const dynamic = "force-dynamic";

const isValidObjectId = (value: string) => ObjectId.isValid(value);

const normalizePath = (path: string[] | undefined) =>
  (path || []).filter((id) => isValidObjectId(id));

const persistCurrentPath = async (userId: string, path: string[]) => {
  const db = await getMongoDb();
  const objectIdPath = path.map((id) => new ObjectId(id));

  const result = await db.collection("User").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { currentPath: objectIdPath } }
  );

  return result.matchedCount > 0;
};

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("no session");
      return new Response(null, { status: 401 });
    }

    const user = await prismadb.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
      select: {
        id: true,
        noteIDs: true,
        currentPath: true,
      },
    });

    if (!user) {
      console.log("user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let currentPath = normalizePath(user.currentPath);

    if (currentPath.length === 0 && user.noteIDs?.length > 0) {
      const rootId = user.noteIDs.find((id) => isValidObjectId(id));
      if (rootId) {
        currentPath = [rootId];
        await persistCurrentPath(user.id, currentPath);
      }
    }

    return NextResponse.json(currentPath);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch current path" },
      { status: 500 }
    );
  }
};
