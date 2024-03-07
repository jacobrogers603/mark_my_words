import React from "react";
import DirectoryItem from "./DirectoryItem";
interface DirectoryItemsProps {
  title: string;
  type: "file" | "directory";
}

const DirectoryItems = (props: {title: string; type: "file" | "directory"}) => {
  return (
    <main>
      <DirectoryItem noteID={'1'} />
    </main>
  );
};

export default DirectoryItems;
