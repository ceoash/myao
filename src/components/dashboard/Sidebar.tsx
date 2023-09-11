import React from "react";
import Button from "./Button";
import Link from "next/link";

import { AppConfig } from "@/utils/AppConfig";
import { handleCopy, handleDownloadQR } from "@/utils/canvas";
import { useQRCode } from "next-qrcode";
import { FaCopy, FaDownload, FaUserFriends } from "react-icons/fa";
import { useRouter } from "next/router";
import { AiFillHome } from "react-icons/ai";
import { MdLocalOffer, MdOutlineTimeline } from "react-icons/md";
import { BiCog } from "react-icons/bi";
import { useSession } from "next-auth/react";

import useQRModal from "@/hooks/useQRModal";
import { BsQrCode } from "react-icons/bs";

const Sidebar = () => {
  const { Canvas } = useQRCode();
  const { data: session } = useSession();
  const router = useRouter();
  const qr = useQRModal();

  return (
    <aside className="hidden md:block md:fixed inset-y-0 left-0 bg-white shadow-md max-h-screen lg:w-60">
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow">
          <div className=" pt-2 text-center border-b">
            <img src="/images/cat.png" className="w-12 pb-3 mx-auto" />
          </div>
          <div className="px-2 py-4">
            <ul className="space-y-1">
              <li className={
                      router.pathname === "/dashboard" ? "text-orange-default" : ""
                    }>
                <Link href="/dashboard">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0 $`}
                  >
                    <AiFillHome className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Dashboard </span>
                  </span>
                </Link>
              </li>
              <li className={
                      router.pathname === "/offers" ? "text-orange-default" : ""
                    }>
                <Link href="/dashboard/offers">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0`}
                  >
                    <MdLocalOffer className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Offers</span>
                  </span>
                </Link>
              </li>
              <li className={
                      router.pathname === "/settings" ? "text-orange-default" : ""
                    }>
                <Link href="/dashboard/friends">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0`}
                  >
                    <FaUserFriends className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Friends</span>
                  </span>
                </Link>
              </li>
              <li className={
                      router.pathname === "/activity" ? "text-orange-default" : ""
                    }>
                <Link href="/dashboard/activity">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0 `}
                  >
                    <MdOutlineTimeline className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Activity</span>
                  </span>
                </Link>
              </li>
              <li className={
                      router.pathname === "/settings" ? "text-orange-default" : ""
                    }>
                <Link href="/dashboard/settings">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-`}
                  >
                    <BiCog className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Settings</span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          onClick={() => qr.onOpen(session?.user.username || "",  "")}
          className="flex justify-center mb-4 lg:hidden hover:cursor-pointer "
        >
          <span
            className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0`}
          >
            <BsQrCode className="text-xl" />
          </span>
        </div>
        <div className="p-6 border-t border-gray-200  mx-1 hidden lg:block">
          <h5 className="mb-3">Share QR Code</h5>
          <div className="p-2 mb-3 border-12 relative items-center justify-center flex flex-col max-w-[280px]">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute rounded-lg"
        >
          <path
            d="M25,2 L2,2 L2,25"
            fill="none"
            className="stroke-gray-300/50 border border-gray-200 rounded-lg"
            strokeWidth="3"
          />
          <path
            d="M2,75 L2,98 L25,98"
            fill="none"
            className="stroke-gray-300/50 border border-gray-200 rounded-lg"
            strokeWidth="3"
          />
          <path
            d="M75,98 L98,98 L98,75"
            fill="none"
            className="stroke-gray-300/50 border border-gray-200 rounded-lg"
            strokeWidth="3"
          />
          <path
            d="M98,25 L98,2 L75,2"
            fill="none"
            className="stroke-gray-300/50 border border-gray-200 rounded-lg"
            strokeWidth="3"
          />
        </svg>
        <div className="px-2">
            <Canvas
              text={`${AppConfig.siteUrl}/connect/${session?.user.username}`}
              options={{
                level: "M",
                margin: 2,
                scale: 4,
                width: 170,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF",
                },
              }}
            />
            </div>
          </div>

          <div className="flex gap-2 text-md justify-start pt-1">
            <button className="flex items-center gap-1 border border-gray-200 rounded-lg text-xs p-1 px-2 hover:bg-gray-50" onClick={handleDownloadQR}><FaDownload />Save</button>
            <button className="flex items-center gap-1 border border-gray-200 rounded-lg text-xs p-1 px-2 hover:bg-gray-50" onClick={() => handleCopy(session?.user.username)}><FaCopy />Copy Link</button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
