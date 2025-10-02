"use client";
// The SessionProvider component is a wrapper for the next-auth session context. It's used to provide the session context to the app. The session context is used to get the user's session. 
import { SessionProvider } from "next-auth/react";

type Props = {
    children?:React.ReactNode;
};

const Provider = ({children}: Props) => {
    return <SessionProvider>{children}</SessionProvider>
};

export default Provider;