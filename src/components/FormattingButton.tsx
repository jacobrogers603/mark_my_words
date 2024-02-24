import React from "react";

// Correctly define the component to accept props
const FormattingButton = ({ name }: { name: string }) => {
  return (
    <button className="mb-4 max-w-20 rounded-lg py-2 px-4 bg-gray-100 text-gray-700 font-bold h-10 border-solid border-2 border-black">
      {name}
    </button>
  );
};

export default FormattingButton;
