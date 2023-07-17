import { AppConfig } from "@/utils/AppConfig";
import { handleCopy, handleDownloadQR } from "@/utils/canvas";
import { useQRCode } from "next-qrcode";
import React, { use, useEffect } from "react";
import Button from "./Button";
import { FaUserFriends } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiFillHome } from "react-icons/ai";
import { BsQrCode } from "react-icons/bs";
import { MdLocalOffer, MdOutlineTimeline } from "react-icons/md";
import { BiCog } from "react-icons/bi";
import axios from "axios";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const { Canvas } = useQRCode();
  const router = useRouter()
  const { data: session } = useSession();

  const [username, setUsername] = React.useState<string | null>(null);

  console.log(session?.user.id) 

  useEffect(() => { 

    fetchUsername();

  }, [session?.user.id])

  const fetchUsername = async () => {
    
    try {
      const response = await axios.post(`/api/dashboard/getUsername`, {
        id: session?.user.id,
      }).then((res) => {
        setUsername(res.data.username.username)
      })
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside className="hidden md:block md:fixed inset-y-0 left-0 bg-white shadow-md max-h-screen lg:w-60">
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow">
          <div className="px-4 pt-2 text-center border-b">
            <img src="/images/cat.png" className="w-12 pb-3 mx-auto" />
          </div>
          <div className="p-4">
          <ul className="space-y-1">
      <li>
        <Link href="/dashboard">
          <span
            className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0 ${
              router.pathname === '/dashboard' ? 'text-orange-400' : ''
            }`}
          >
            <AiFillHome className="text-xl lg:mr-4" />
            <span className="hidden lg:block">Dashboard </span>
          </span>
        </Link>
      </li>
      <li>
        <Link href="/dashboard/offers">
          <span
            className={`flex items-center rounded-xl font-bold text-md text-gray-900 py-3 px-4 lg:pr-0 ${
              router.pathname === '/dashboard/offers' ? 'text-orange-400' : ''
            }`}
          >
            <MdLocalOffer className="text-xl lg:mr-4" />
            <span className="hidden lg:block">Offers</span>
          </span>
        </Link>
      </li>
      <li>
        <Link href="/dashboard/friends">
          <span
            className={`flex items-center rounded-xl font-bold text-md text-gray-900 py-3 px-4 lg:pr-0 ${
              router.pathname === '/dashboard/friends' ? 'text-orange-400' : ''
            }`}
          >
            <FaUserFriends className="text-xl lg:mr-4" />
            <span className="hidden lg:block">Friends</span>
          </span>
        </Link>
      </li>
      <li>
        <Link href="/dashboard/activity">
          <span
            className={`flex items-center rounded-xl font-bold text-md text-gray-900 py-3 px-4 lg:pr-0 ${
              router.pathname === '/dashboard/activity' ? 'text-orange-400' : ''
            }`}
          >
            <MdOutlineTimeline className="text-xl lg:mr-4" />
            <span className="hidden lg:block">Activity</span>
          </span>
        </Link>
      </li>
      <li>
        <Link href="/dashboard/settings">
          <span
            className={`flex items-center rounded-xl font-bold text-md text-gray-900 py-3 px-4 lg:pr-0 ${
              router.pathname === '/dashboard/settings' ? 'text-orange-400' : ''
            }`}
          >
            <BiCog className="text-xl lg:mr-4" />
            <span className="hidden lg:block">Settings</span>
          </span>
        </Link>
      </li>
      
    </ul>
          </div>
        </div>
        <div className="flex justify-center mb-4 lg:hidden ">
        <Link href="/dashboard/friends">
          <span
            className={`flex items-center rounded-xl font-bold text-md text-gray-900 py-3 px-4 lg:pr-0`}
          >
            <BsQrCode className="text-xl" />
          </span>
        </Link>
      </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50 hidden lg:block">
          <h5 className="mb-4">Share QR Code</h5>
          <div className="border border-gray-200 rounded-lg mb-4">

            <Canvas
              text={`$https://myao.vercel.app/connect/${username}`}
              options={{
                level: "M",
                margin: 2,
                scale: 4,
                width: 180,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF",
                },
              }}
            />
          </div>

          <div className="flex gap-2 text-md justify-start">
            <Button
              onClick={ handleDownloadQR}
            >
              Download
            </Button>
            <Button
              onClick={handleCopy}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
