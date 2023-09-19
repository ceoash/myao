import Avatar from "./Avatar";
import Link from "next/link";
import MenuItem from "./MenuItem";
import axios from "axios";
import SearchComponent from "./SearchComponent";
import useQRModal from "@/hooks/useQRModal";
import useSearchComponentModal from "@/hooks/useSearchComponentModal";
import { BiBell, BiMessage, BiSearch } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { SafeUser } from "@/types";
import { useUnreadMessages } from "@/context/UnreadMessagesContext";
import { useSocketContext } from "@/context/SocketContext";
import { Session } from "next-auth";
import { ImQrcode } from "react-icons/im";
import { signOut } from "next-auth/react";
import { useAlerts } from "@/hooks/AlertHook";

interface IUserMenuProps {
  currentUser?: SafeUser | null;
  session: Session | null;
  blockedUsers?: string[];
  toggle?: boolean;
  setToggle: (mobile?: boolean) => void;
  sidebarOpen?: boolean;
  buttonRef?: any;
}

const UserMenu: React.FC<IUserMenuProps> = ({ session, blockedUsers, setToggle, toggle, sidebarOpen, buttonRef }) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const search = useSearchComponentModal();
  const qr = useQRModal();

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
};

  const { setUnreadCount, unreadCount } = useUnreadMessages();
  const socket = useSocketContext();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);
  useEffect(() => {
    if (!isMounted) return;
    if (session?.user?.id) {
      axios
        .get(`/api/dashboard/unreadMessagesCount?userId=${session?.user.id}`)
        .then((response) => {
          setUnreadCount(response.data.count);
        })
        .catch((error) => {
          console.error("Failed to fetch unread messages count:", error);
        });
    }
  }, [isMounted]);

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

  useEffect(() => {
    if (!isMounted) return;
    socket.emit("register", session?.user.id);
    return () => {
      socket.off("register");
      socket.emit("unregister", session?.user.id);
    };
  }, [isMounted]);

  const alerts = useAlerts();

  useEffect(() => {
    socket.on("message_sent", (newMessage: any) => {
      console.log("newMessage", newMessage);
     if (newMessage?.userId === session?.user?.id) return;
     setUnreadCount((prev: number) => prev + 1);
    });
    return () => {
      socket.off("message_sent");
    };
  }, [isMounted, session?.user?.id]);

  return (
    <header className="w-full z-50 antialiased fixed ">
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
            <div className="md:hidden cursor-pointer" onClick={search.onOpen}>
              <BiSearch />
            </div>

            <div className="relative cursor-pointer">
              <button
              className="h-[16px]"
                onClick={() =>
                  qr.onOpen(
                    session?.user.username || "",
                    user?.profile?.image || ""
                  )
                }
              >
                <ImQrcode className="cursor-pointer h-[16px] text-gray-600" />
              </button>
            </div>

            <div className="hidden md:block relative cursor-pointer">
              <Link href={`/dashboard/conversations`} className="relative">
                {unreadCount > 0 && (
                  <div className="
                  -top-1
                  -right-1
                  flex
                  absolute
                  justify-center
                  items-center
                  p-0.5
                  w-4
                  text-xs
                  font-bold
                  text-white
                  bg-orange-default
                  rounded-full
                  h-[16px]
                  ">
                    {unreadCount}
                  </div>
                )}
                <BiMessage className="h-[19px] text-gray-600" />
              </Link>
            </div>

            <div className="relative cursor-pointer">
              <div ref={buttonRef} onClick={() => setToggle(false)}>
                <BiBell className="h-[20px] text-gray-600" />
              </div>
            
              {/* { alerts.alerts?.unreadNotifications && 
                alerts.alerts?.unreadNotifications > 0 && (
                  <div className="
                  -top-1
                  -right-1
                  flex
                  absolute
                  justify-center
                  items-center
                  p-0.5
                  w-4
                  text-xs
                  font-bold
                  text-white
                  bg-orange-default
                  rounded-full
                  h-[16px]
                  ">
                    {alerts.alerts?.unreadNotifications}
                  </div>
                )} */}
              
            </div>
            <div
              ref={buttonRef} onClick={handleToggle}
              className="
                py-2 px-3
                md:py-1
                md:px-2
                border-[1px]
                border-gray-200
                flex-row
                items-center
                justify-center
                gap-3
                rounded-lg
                md:rounded-full
                cursor-pointer
                hover:shadow-md
                transition
                relative
                bg-gray-50
                hidden md:flex
              "
            >
              <div className="">
                <Avatar user={user} />
              </div>
              <AiOutlineMenu className="text-gray-600 md:text-gray-400" />
            </div>
            <div
              ref={buttonRef}
              onClick={() => setToggle(true)}
              className="
                py-2 px-3
                md:py-1
                md:px-2
                border-[1px]
                border-gray-200
                flex-row
                items-center
                justify-center
                gap-3
                rounded-lg
                md:rounded-full
                cursor-pointer
                hover:shadow-md
                transition
                relative
                bg-gray-50
                block md:hidden
              "
            >
              
              <AiOutlineMenu className="text-gray-600 md:text-gray-400" />
            </div>
            {isOpen && (
              <div
                className={`transition-all ease-in-out duration-200 rouned-xl shadow-md bg-white overflow-hidden right-0 w-full top-14 -mt-1 text-sm absolute rounded-b-xl border border-gray-200 `}
                ref={dropdownRef}
                style={{ zIndex: 9999 }}
              >
                <div className="flex flex-col cursor-pointer z-50"> 
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
