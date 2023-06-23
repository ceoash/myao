import axios from "axios";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";

interface User {
  id: number;
  username: string;
  profile: {
    image: string;
  };
}


const SearchComponent = () => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);


  const handleClickOutside = (event: any) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setUser(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });


  const onSearch = () => {
    axios
      .get(`/api/getUserByUsernameApi?username=${search.toLowerCase()}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log("error");
      });
  };

  return (
    <div className="relative flex-1 mx-20 hidden md:block">
      <div className="flex flex-grow flex-nowrap">
        <input
          type="text"
          placeholder="Search user"
          className="border border-gray-200 rounded-l-lg px-4 py-2 w-full lowercase"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded-r-lg"
          onClick={onSearch}
        >
          <BiSearch />
        </button>
      </div>
      {user && (
        <div
          className="absolute rouned-xl shadow-md bg-white overflow-hidden right-0 w-full top-14 -mt-1 text-sm rounded-b-md"
          ref={searchRef}
        >
          <div className="flex flex-col cursor-pointer px-4 py-2">
            <Link href={`/dashboard/profile/${user.id}`}>
              <div className="flex justify-between">
                <div className="flex gap-2 h-10">
                  <img
                    className="rounded-full"
                    src={
                      user?.profile?.image || `/images/placeholders/avatar.png`
                    }
                  />
                  <div className="text-md">{user.username}</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
