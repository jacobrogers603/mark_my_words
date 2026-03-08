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

export const POST = async (req: Request) => {
  try {
    const { directoryId } = await req.json();

    if (!directoryId || !isValidObjectId(directoryId)) {
      return NextResponse.json(
        { error: "directoryId must be a valid ObjectId" },
        { status: 400 }
      );
    }

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
        currentPath: true,
      },
    });

    if (!user) {
      console.log("user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPath = normalizePath(user.currentPath);
    const updatedPath = [...currentPath, directoryId];

    const persisted = await persistCurrentPath(user.id, updatedPath);
    if (!persisted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPath);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update current path" },
      { status: 500 }
    );
  }
};

export const DELETE = async () => {
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
        currentPath: true,
      },
    });

    if (!user) {
      console.log("user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPath = normalizePath(user.currentPath);
    if (currentPath.length <= 1) {
      return NextResponse.json(currentPath);
    }

    const updatedPath = currentPath.slice(0, -1);
    const persisted = await persistCurrentPath(user.id, updatedPath);

    if (!persisted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPath);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update current path" },
      { status: 500 }
    );
  }
};
