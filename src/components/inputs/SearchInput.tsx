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
    <div className="flex border border-gray-200 rounded-lg">
      <input
        type="text"
        className="flex-1 mx-2 lowercase"
        placeholder={placeholder || "Search..."}
        value={search.toLowerCase()}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={onSearch}
        className="bg-orange-400 p-2 text-white rounded-r-lg"
      >
        <BiSearch />
      </button>
    </div>
  );
};

export default SearchInput;
