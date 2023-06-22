import React from "react";
import { BiSearch } from "react-icons/bi";

interface SearchInputProps {
    search: string;
    setSearch: (search: string) => void;
    onSearch: () => void;
    placeholder?: string;
}

const SearchInput = ({search, setSearch, onSearch, placeholder}: SearchInputProps) => {

  return (
    <div className="flex border-2 border-gray-200 rounded-r-md">
      <input
        type="text"
        className="flex-1 mx-2"
        placeholder={placeholder || "Search..."}
        value={search.toLowerCase()}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={onSearch}
        className="bg-orange-500 p-2 text-white rounded-r-md"
      >
        <BiSearch />
      </button>
    </div>
  );
};

export default SearchInput;
