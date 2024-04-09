
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import authOptions from '../../../../../auth';
import { getServerSession } from 'next-auth';
// export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { noteId: string}}){
    const session = await getServerSession(authOptions);

    if(session){
        
        const id = params.noteId;

        if(typeof id !== 'string'){
            throw new Error('Invalid id');
        }
        if(!id){
            throw new Error('Invalid id');
        }
        try {
            const note = await prismadb.note.findUnique({
                where: {
                    id: id
                }
            });
            if(!note){
                throw new Error('No Such Note Found');
            }
            
            return NextResponse.json(note);
        } catch (error) {
            return NextResponse.json(error);
        }
    }
}
