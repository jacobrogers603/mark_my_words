import React from "react";
import SearchBar from "./SearchBar";

const NavBar = () => {
  return (
    <nav className="grid grid-cols-6 absolute top-0 w-full place-items-center bg-amber-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <img src="" alt="logo" />
      </div>
      <div className="col-start-5 col-end-7">
        <SearchBar />
      </div>
    </nav>
  );
};

export default NavBar;
