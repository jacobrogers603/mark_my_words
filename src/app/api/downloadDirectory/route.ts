import JSZip from "jszip";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { Note } from "@prisma/client";
import { Readable } from "stream";
import { decrypt } from "@/lib/encryption";

async function addFilesToZip(
  note: Note,
  htmlMode: boolean,
  zip: JSZip,
  isRoot: boolean = true
): Promise<void> {
  const decryptedDirTitle = decrypt(note.title, true);
  const target = isRoot ? zip : zip.folder(decryptedDirTitle);
  if (!target) return;

  const children = await prismadb.note.findMany({
    where: { parentId: note.id },
  });

  for (const child of children) {
    if (child.isDirectory) {
      await addFilesToZip(child, htmlMode, target, false);
    } else {
      const decryptedContent = child.content ? decrypt(child.content, false) : '';
      const decryptedHtmlContent = child.htmlContent ? decrypt(child.htmlContent, false) : '';
      const decryptedTitle = child.title ? decrypt(child.title, true) : '';

      target.file(
        `${decryptedTitle}.${htmlMode ? "html" : "md"}`,
        `${htmlMode ? decryptedHtmlContent : decryptedContent}`
      );
    }
  }
}

// Route handler for POST method
export async function POST(req: NextRequest) {
  const { id, htmlMode } = await req.json();
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
  await addFilesToZip(note, htmlMode, zip);

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
