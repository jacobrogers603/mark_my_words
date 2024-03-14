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
            const currentDirNotes = await prismadb.note.findMany({
                where: {
                    id: {
                        in: user?.noteIDs,

                    }
                }
            })
            return NextResponse.json(currentDirNotes)
        }
        catch (error) {
            return NextResponse.json(error)
        }
    }else {
        return new Response(null, { status: 401 });
    }
}