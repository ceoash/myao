"use client";
import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import useSearchComponentModal from "@/hooks/useSearchComponentModal";
import { BiSearch } from "react-icons/bi";
import { Profile, User } from "@prisma/client";
import { IoClose } from "react-icons/io5";

export interface ErrorResponse {
  error: string;
}

interface IUser extends User {
    profile: Profile;
}

const SearchComponentModal = () => {
  const { isOpen, onClose } = useSearchComponentModal();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState<IUser | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setSearch("");
    setUser(null);
    onClose();
  };

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
  
  let bodyContent = (
    <div className="border border-gray-200 rounded-lg mb-4 flex justify-center">
      <div className={`md:relative w-full`}>
      <div className={`flex-grow flex-nowrap  ${user ? 'hidden' : 'flex'}`}>
        <input
          type="text"
          placeholder="Search user"
          className="border border-gray-200 rounded-l-lg px-4 py-2 w-full lowercase"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-orange-default text-white px-4 py-2 rounded-r-lg"
          onClick={onSearch}
        >
          <BiSearch />
        </button>
      </div>
      {user && (
        <div
          className="md:absolute rounded-xl border border-gray-200 bg-white overflow-hidden right-0 w-full top-14 -mt-1 text-sm rounded-b-md"
          ref={searchRef}
        >
          <div className="flex flex-col cursor-pointer px-4 py-4 bg-slate-50">
            <Link onClick={close} href={`/dashboard/profile/${user.id}`}>
              <div className="flex items-center gap-2">
                <div className="flex gap-2 h-8 w-8 relative">
                  <Image
                    alt="profile image"
                    layout="fill"
                     objectFit="cover"
                    className="rounded-full"
                    src={
                      user?.profile?.image || `/images/placeholders/avatar.png`
                    }
                  />
                </div>
                <div className="text-md">{user.username}</div>
                <IoClose className="ml-auto" onClick={() => setUser(null)} />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
    </div>
  );

  return (
    <Modal
      title="User Search"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {}}
      secondaryAction={() => {}}
      body={bodyContent}
      auto
    />
  );
};

export default SearchComponentModal;
