import React, { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { AiOutlineMenu } from "react-icons/ai";
import { BiBell, BiCog, BiMessage, BiTrash } from "react-icons/bi";
import Avatar from "./Avatar";
import Link from "next/link";
import MenuItem from "./MenuItem";
import { User } from "@prisma/client";
import { SafeUser } from "@/types";

interface IUserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<IUserMenuProps> = ({session}: any) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

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
    <header className="w-full z-50">
  <nav className="bg-white border-gray-200 py-2.5 shadow border-b">
    <div className="flex flex-wrap items-center justify-between px-4 container mx-auto">
      <Link href="/dashboard" className="flex items-center">
        <img src="/images/cat.png" className="h-[30px] mr-2" />
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          MYAO
        </span>
      </Link>
      <div className="relative flex items-center text-xl lg:order-2 gap-4"> {/* Added relative here */}
        <div className="relative">
          <a href="/dashboard/settings">
            <BiCog />
          </a>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <BiBell />
          </button>
          {isNotificationsOpen && (
            <div
              className="absolute rouned-xl shadow-md bg-white overflow-hidden right-0 w-auto top-10 text-sm" 
              ref={notificationsRef}
            >
              <div className="flex flex-col cursor-pointer">
                <MenuItem label="0 Notifications" onClick={() => {}} />
                
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setIsMessagesOpen(!isMessagesOpen)}>
            <BiMessage />
          </button>
          {isMessagesOpen && (
            <div
              className="absolute rouned-xl shadow-md bg-white overflow-hidden right-0 w-auto top-10 text-sm" 
              ref={settingsRef}
            >
              <div className="flex flex-col cursor-pointer">
                <MenuItem label="0 messages" onClick={() => {}} />
              </div>
            </div>
          )}
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
            <Avatar />
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
