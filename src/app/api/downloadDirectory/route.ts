import JSZip from "jszip";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { Note } from "@prisma/client";
import { Readable } from "stream"; // Node.js stream module for handling streams

async function addFilesToZip(note: Note, zip: JSZip, isRoot: boolean = true): Promise<void> {
  const target = isRoot ? zip : zip.folder(note.title);
  if (!target) return;

  const children = await prismadb.note.findMany({
      where: { parentId: note.id }
  });

  for (const child of children) {
      if (child.isDirectory) {
          await addFilesToZip(child, target, false);
      } else {
          target.file(`${child.title}.md`, child.content || '');
      }
  }
}

// Route handler for POST method
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await req.json();
  const note = await prismadb.note.findUnique({
    where: { id },
  });

  if (!note || !note.isDirectory) {
    return new NextResponse(null, {
      status: 404,
      statusText: "Note not found or not a directory",
    });
  }

  const zip = new JSZip();
  await addFilesToZip(note, zip);

  // Generate the ZIP stream and convert it to ReadableStream<Uint8Array> for NextResponse
  const nodeStream = await zip.generateNodeStream({
    type: "nodebuffer",
    streamFiles: true,
  });
  const readableStream = new ReadableStream<Uint8Array>({
    start(controller) {
      const nodeReadable = new Readable().wrap(nodeStream);
      nodeReadable.on("data", (chunk) => {
        controller.enqueue(
          new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)
        );
      });
      nodeReadable.on("end", () => {
        controller.close();
      });
      nodeReadable.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  const response = new NextResponse(readableStream);
  response.headers.set("Content-Type", "application/zip");
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(note.title)}.zip"`
  );
  return response;
}
