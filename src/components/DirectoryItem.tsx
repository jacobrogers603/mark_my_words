import React from "react";

const DirectoryItem = ({noteID}: {noteID: string}) => {

  const findTitle = (NoteID: string) => {
    // This is a placeholder function that will be replaced with a call to the API
    // to retrieve the title of the note from the database.
    return "Note Title" + NoteID;
  }


  return (
    <main>
      <div className="grid place-items-center w-64 h-10 border-solid rounded-md border-2 border-amber-500">
        {findTitle(noteID)}
      </div>
    </main>
  );
};

export default DirectoryItem;