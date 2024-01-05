import React, { useState } from "react";
import { Tooltip } from "react-tooltip";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <Tooltip id="searchbarTooltip" />
      <input
        className="rounded-md"
        type="text"
        placeholder=" search notes or users..."
        value={searchTerm}
        onChange={handleInputChange}
        data-tooltip-id="searchbarTooltip"
        data-tooltip-content="Search instructions TODO"
      />
    </div>
  );
};

export default SearchBar;
