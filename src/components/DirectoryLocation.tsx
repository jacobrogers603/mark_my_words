import React from "react";

type DirectoryLocationProps = {
  title: string;
  id: string;
  changeCurrentDirectory: (id: string, title: string) => void;
};

const DirectoryLocation = ({
  title,
  id,
  changeCurrentDirectory,
}: DirectoryLocationProps) => {
  return (
    <main
      className={`w-[80%] md:w-[60%] h-10 grid place-items-center bg-amber-100 hover:bg-amber-200 cursor-pointer border-solid border-2 border-black rounded-md mb-2 p-2 overflow-auto`}
      onClick={() => changeCurrentDirectory(id, title)}>
      <h1 className="text-black">{title}</h1>
    </main>
  );
};

export default DirectoryLocation;
