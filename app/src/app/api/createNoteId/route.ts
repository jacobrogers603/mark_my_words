import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { ObjectId } from "mongodb";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let isUnique = false;
    let newId: string = "noID";

    while (!isUnique) {
      newId = new ObjectId().toString();
      const existingNote = await prismadb.note.findUnique({
        where: { id: newId },
      });
      if (!existingNote) {
        isUnique = true;
      }
    }

    return NextResponse.json({ id: newId });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
