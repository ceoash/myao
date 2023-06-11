import React, { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { AiOutlineMenu } from "react-icons/ai";
import { BiCog, BiMessage, BiSearch, BiTrash } from "react-icons/bi";
import Avatar from "./Avatar";
import Link from "next/link";
import MenuItem from "./MenuItem";
import { User } from "@prisma/client";
import { SafeUser } from "@/types";
import axios from "axios";
import SearchComponent from "./SearchComponent";

interface IUserMenuProps {
  currentUser?: SafeUser | null;
  session: any; 
}

const UserMenu: React.FC<IUserMenuProps> = ({session}: any) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/getUserByIdApi');
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
    <header className="w-full z-0">
  <nav className="bg-white border-gray-200 py-2.5 shadow border-b">
    <div className="flex flex-wrap items-center justify-between px-4 container mx-auto">
      <Link href="/dashboard" className="flex items-center">
        <img src="/images/cat.png" className="h-[30px] mr-2" />
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          MYAO
        </span>
      </Link>


        <SearchComponent />

      

      
     
      <div className="relative flex items-center text-xl lg:order-2 gap-4"> {/* Added relative here */}
        
     
        <div className="relative">
          <a href="/dashboard/settings">
            <BiCog />
          </a>
        </div>

        
        <div className="relative">
          <Link href={`/dashboard/conversations`}>
            <BiMessage />
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
          ">
          <div className="hidden md:block">
            <Avatar user={user} />
          </div>
          <AiOutlineMenu />
        </div>
        {isOpen && (
          <div
            className="absolute rouned-xl shadow-md bg-white overflow-hidden right-0 w-auto top-14 -mt-1 text-sm"
            ref={dropdownRef}
          >
            <div className="flex flex-col cursor-pointer">
              <>
                <MenuItem label="Profile" link url={"/dashboard/my-profile"} />
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
</header>

  );
};

export default UserMenu;


