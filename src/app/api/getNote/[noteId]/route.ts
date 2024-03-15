
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import authOptions from '../../../../../auth';
import { getServerSession } from 'next-auth';

export async function GET(req: Request, { params }: { params: { noteId: string}}){
    const session = await getServerSession(authOptions);

    if(session){
        console.log('getting note')
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
                throw new Error('Invalid id');
            }
            console.log('note', note)
            return NextResponse.json(note);
        } catch (error) {
            return NextResponse.json(error);
        }
    }
}
