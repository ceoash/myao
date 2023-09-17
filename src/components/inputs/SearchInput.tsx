import Spinner from "../Spinner";
import { BiSearch } from "react-icons/bi";

interface SearchInputProps {
    search: string;
    isLoading?: boolean;
    placeholder?: string;
    setSearch: (search: string) => void;
    onSearch: () => void;
}

const SearchInput = ({
  search, 
  isLoading,
  placeholder, 
  setSearch, 
  onSearch, 
}: SearchInputProps) => {
  
  return (
    <div className="flex border border-gray-200 rounded-lg ring-0 focus:ring-0 focus:ring-white ring-orange-500 focus:border-0 ">
      <input
        type="text"
        className="flex-1 mx-2 lowercase p-2 focus:ring-0 outline-none"
        placeholder={placeholder || "Search..."}
        value={search.toLowerCase()}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={onSearch}
        className="bg-orange-default p-2 px-4 text-white rounded-r-lg"
      >
        { isLoading ? <Spinner /> : <BiSearch /> }
      </button>
    </div>
  );
};

export default SearchInput;
