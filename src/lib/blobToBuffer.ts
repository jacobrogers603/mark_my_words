export async function blobToBuffer(blob: Blob): Promise<Buffer> {
    return Buffer.from(await blob.arrayBuffer());
}