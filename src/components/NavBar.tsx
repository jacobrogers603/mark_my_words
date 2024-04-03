import { GiRamProfile } from "react-icons/gi";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";

interface NavBarProps {
  editor?: boolean;
  routeHome?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ editor, routeHome }) => {
  const router = useRouter();

  const routeUserSettings = () => {
    router.push("/user-settings");
  };

  return (
    <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
      <div className="col-start-8 z-20">
        {editor ? (
          <GiRamProfile className=" bg-blue-400 rounded-full p-1 border-solid border-black border-2" size={40} onClick={routeHome}/>
        ) : (
          <Popover>
            <PopoverTrigger>
              <GiRamProfile
                className=" bg-blue-400 rounded-full p-1 border-solid border-black border-2"
                size={40}
              />
            </PopoverTrigger>
            <PopoverContent className="bg-blue-100 w-auto h-auto rounded-md m-2 border-solid border-black border-2 flex flex-col">
              <Button
                className="m-6 mb-3"
                variant="secondary"
                onClick={() => signOut()}>
                Sign Out
              </Button>
              <Button
                className="m-6 mt-3"
                variant="secondary"
                onClick={routeUserSettings}>
                <IoSettingsSharp className="mr-2" />
                User Settings
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
