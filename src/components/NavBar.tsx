import { GiRamProfile } from "react-icons/gi";
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { PencilRuler } from "lucide-react";
import axios from "axios";

interface NavBarProps {
  editor?: boolean;
  routeHomeProvided: boolean;
  routeHome?: () => void;
  userProvided: boolean;
  userProp?: User | undefined;
}

interface User {
  id: string;
  email: string;
  username: string;
}

const NavBar: React.FC<NavBarProps> = ({
  editor,
  routeHomeProvided,
  routeHome,
  userProp,
  userProvided,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [prettyUsername, setPrettyUsername] = useState<String>("Loading...");
  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (userProvided && userProp) {
      setUser(userProp);
    }
  }, [userProp, userProvided]);

  const routeUserSettings = () => {
    router.push("/user-settings");
  };

  const routeHomeDefault = () => {
    router.push("/");
  };

  const routePublicProfile = () => {
    router.push(`/${user?.username}`);
  };

  const routeShared = () => {
    router.push("/shared");
  };

  const prettyUpUsername = (input: string) => {
    if (!input) {
      return "No username";
    }

    const username = input;
    let retval = "";
    let i = 0;

    while (i < username.length) {
      if (i === 0 || username[i - 1] === "_") {
        retval += username[i].toUpperCase();
      } else if (username[i] !== "_") {
        retval += username[i];
      } else {
        retval += " ";
      }
      i++;
    }

    return retval;
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/getCurrentUsername");
      setUser(response.data);
    } catch (error) {
      console.log("Failed to fetch user", error);
    }
  };

  useEffect(() => {
    if (!user && !userProvided) {
      fetchUser();
    }
  }, [user, userProvided]);

  useEffect(() => {
    if (user) {
      setPrettyUsername(prettyUpUsername(user.username));
    }
  }, [user]);

  return (
    <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
      {routeHomeProvided ? (
        <PencilRuler
          onClick={routeHome}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      ) : (
        <PencilRuler
          onClick={routeHomeDefault}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      )}
      {status === "unauthenticated" || status === "loading" ? null : (
        <div className="col-start-8 z-20">
          {editor ? (
            <GiRamProfile
              className=" bg-blue-400 rounded-full p-1 border-solid border-black border-2"
              size={40}
              onClick={routeHome}
            />
          ) : (
            <Popover>
              <PopoverTrigger>
                <GiRamProfile
                  className=" bg-blue-400 rounded-full p-1 border-solid border-black border-2"
                  size={40}
                />
              </PopoverTrigger>
              <PopoverContent className="bg-blue-100 w-auto h-auto rounded-md m-2 border-solid border-black border-[0.1875rem] flex flex-col p-2">
                <h1 className="font-bold text-center flex flex-col">
                  <span className="text-amber-600">
                    {prettyUsername || "Loading..."}
                  </span>
                  <span className="text-gray-600">
                    {"(" + user?.email + ")"}
                  </span>
                </h1>
                {pathname !== `/${user?.username}` ? (
                  <Button
                    className="m-6 my-3"
                    variant={"secondary"}
                    onClick={routePublicProfile}>
                    Public Profile
                  </Button>
                ) : null}
                {pathname === `/${user?.username}` ? (
                  <Button
                    className="m-6 my-3"
                    variant="secondary"
                    onClick={routeHomeDefault}>
                    Private Profile
                  </Button>
                ) : null}
                {pathname !== "/shared" ? (
                  <Button
                    className="m-6 my-3"
                    variant="secondary"
                    onClick={routeShared}>
                    Shared
                  </Button>
                ) : null}
                {pathname !== "/user-settings" ? (
                  <Button
                    className="m-6 my-3"
                    variant="secondary"
                    onClick={routeUserSettings}>
                    <IoSettingsSharp className="mr-2" />
                    User Settings
                  </Button>
                ) : null}
                <Button
                  className="m-6 my-3"
                  variant="destructive"
                  onClick={() => signOut()}>
                  Sign Out
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
