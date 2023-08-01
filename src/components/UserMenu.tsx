import React, { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { AiOutlineMenu } from "react-icons/ai";
import { BiCog, BiMessage, BiSearch } from "react-icons/bi";
import Avatar from "./Avatar";
import Link from "next/link";
import MenuItem from "./MenuItem";
import { User } from "@prisma/client";
import { SafeUser } from "@/types";
import axios from "axios";
import SearchComponent from "./SearchComponent";
import useQRModal from "@/hooks/useQRModal";
import { BsQrCode } from "react-icons/bs";

interface IUserMenuProps {
  currentUser?: SafeUser | null;
  session: any;
}

const UserMenu: React.FC<IUserMenuProps> = ({ session }: any) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchBox, setSearchBox] = useState(false);

  const qr = useQRModal();

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/getUserByIdApi");
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    if (session) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="w-full z-40 antialiased fixed">
      <nav className="bg-white border-gray-200 py-2.5 shadow border-b relative">
        <div className="flex flex-wrap items-center justify-between px-4">
          <div className="w-40 lg:w-60">
            <Link href="/dashboard" className="flex items-center">
              <img src="/images/cat.png" className="h-[30px] mr-2 px-2" />
              <span className="self-center text-xl font-semibold whitespace-nowrap">
                MYAO
              </span>
            </Link>
          </div>
          <SearchComponent navbar />

          <div
            className="relative flex items-center text-xl lg:order-2 gap-4"
            style={{ zIndex: 9999 }}
          >
            <div className="md:hidden cursor-pointer">
              <div onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <BiSearch />
              </div>
            </div>

            <div className="relative cursor-pointer">
              <div onClick={qr.onOpen}>
                <BsQrCode className="h-4 cursor-pointer" />
              </div>
            </div>

            <div className="relative cursor-pointer">
              <Link href={`/dashboard/conversations`}>
                <BiMessage />
              </Link>
            </div>

            <div className="hidden md:block relative cursor-pointer">
              <Link href="/dashboard/settings">
                <BiCog />
              </Link>
            </div>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="
            p-4
            md:py-1
            md:px-2
            border-[1px]
            border-neutral-200
            flex
            flex-row
            items-center
            justify-center
            gap-3
            rounded-full
            cursor-pointer
            hover:shadow-md
            transition
            relative
          "
            >
              <div className="hidden md:block">
                <Avatar user={user} />
              </div>
              <AiOutlineMenu />
            </div>
            {isOpen && (
              <div
                className="absolute rouned-xl shadow-md bg-white overflow-hidden right-0 w-full top-14 -mt-1 text-sm"
                ref={dropdownRef}
                style={{ zIndex: 9999 }}
              >
                <div className="flex flex-col cursor-pointer z-50">
                  <div className="flex flex-col md:hidden">
                    <MenuItem label="Offers" link url={"/dashboard/offers"} />
                    <MenuItem label="Friends" link url={"/dashboard/friends"} />
                    <MenuItem
                      label="Activity"
                      link
                      url={"/dashboard/activity"}
                    />
                    <MenuItem
                      label="Settings"
                      link
                      url={"/dashboard/settings"}
                    />
                  </div>
                  <>
                    <MenuItem
                      label="Profile"
                      link
                      url={"/dashboard/my-profile"}
                    />
                    <MenuItem label="Support" onClick={() => {}} />
                    <hr className="border-neutral-200 mt-1" />
                    <MenuItem label="Logout" onClick={() => signOut()} />
                  </>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
        {isSearchOpen && (
          <div
            className=" rouned-xl shadow-md bg-white overflow-hidden right-0 w-full bottom-0 mt-10 text-sm"
            ref={searchRef}
            style={{ zIndex: 9999 }}
          >
            <SearchComponent />
          </div>
        )}
    </header>
  );
};

export default UserMenu;
