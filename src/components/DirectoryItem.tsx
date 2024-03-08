import { JsonObject } from "@prisma/client/runtime/library";
import axios from "axios";
import React, { useEffect, useState } from "react";

const DirectoryItem = ({ note }: { note: JsonObject }) => {

  return (
    <main>
      <div className="grid place-items-center w-64 h-10 border-solid rounded-md border-2 border-amber-500">
        {note?.title?.toString() ?? 'No title'}
      </div>
    </main>
  );
};

export default DirectoryItem;
