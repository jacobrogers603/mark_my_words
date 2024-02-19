import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import prismadb from '@/lib/prismadb';

// This file is used to check if the user is authenticated on the server side.
const serverAuth = async (req: NextApiRequest) => {

    const session = await getSession({req});

    if(!session?.user?.email){
        throw new Error('Not signed in');
    }

    const currentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email
        }
    })

    if(!currentUser){
        throw new Error('Not signed in');
    }

    return { currentUser };
}

export default serverAuth;