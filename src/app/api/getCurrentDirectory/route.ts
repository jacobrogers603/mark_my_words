import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
import prismadb from '@/lib/prismadb';
import { NextResponse } from "next/server";


// Return the notes from a directory.
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (session) {
        
        try {
            const user = await prismadb.user.findUnique({
                where: {
                    email: session?.user?.email || ''
                }
            })

            // Find the current directory.
            const currentDir = await prismadb.note.findUnique({
                where: {
                    id: user?.currentDirectoryId ?? undefined
                }
            })

            // Get all the children notes of that directory.
            const currentDirNotes = await prismadb.note.findMany({
                where: {
                    id: {
                        in: currentDir?.childrenIds
                    }
                }
            });             

            return NextResponse.json(currentDirNotes)
        }
        catch (error) {
            return NextResponse.json(error)
        }
    }else {
        return new Response(null, { status: 401 });
    }
}