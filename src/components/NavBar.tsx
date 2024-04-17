import { GiRamProfile } from "react-icons/gi";
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { PencilRuler } from "lucide-react";
import axios from "axios";
import { forEach } from "jszip";

interface NavBarProps {
  editor?: boolean;
  routeHome?: () => void;
}

interface User {
  username: string;
  email: string;
}

const NavBar: React.FC<NavBarProps> = ({ editor, routeHome }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [prettyUsername, setPrettyUsername] = useState<String>("Loading...");

  const routeUserSettings = () => {
    router.push("/user-settings");
  };

  const routeHomeNoEditor = () => {
    router.push("/");
  };

  const routePublicProfile = () => {
    router.push(`/${currentUser?.username}`);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get<User>("/api/current");
      setCurrentUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const prettyUpUsername = () => {
    if (!currentUser) {
      return "No username";
    }

    const username = currentUser.username;
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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setPrettyUsername(prettyUpUsername());
    }
  }, [currentUser, prettyUpUsername]);

  return (
    <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
      {editor ? (
        <PencilRuler
          onClick={routeHome}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      ) : (
        <PencilRuler
          onClick={routeHomeNoEditor}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      )}
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
                  {"(" + currentUser?.email + ")"}
                </span>
              </h1>
              {pathname !== `/${currentUser?.username}` ? (
                <Button
                  className="m-6 my-3"
                  variant={"secondary"}
                  onClick={routePublicProfile}>
                  Public Profile
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
    </nav>
  );
};

export default NavBar;
