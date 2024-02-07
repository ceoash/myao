
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
import { RiBankCardFill } from "react-icons/ri";

const AdminSidebar = () => {
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
                      router.pathname === "/admin/dashboard" ? "text-orange-default" : ""
                    }>
                <Link href="/admin">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0 $`}
                  >
                    <AiFillHome className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Dashboard </span>
                  </span>
                </Link>
              </li>
              <li className={
                      router.pathname === "/admin/negotiations" ? "text-orange-default" : ""
                    }>
                <Link href="/admin/negotiations">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0`}
                  >
                    <MdLocalOffer className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Trades</span>
                  </span>
                </Link>
              </li>
              {/* <li className={
                      router.pathname === "/admin/payments" ? "text-orange-default" : ""
                    }>
                <Link href="/admin/payments">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0`}
                  >
                    <RiBankCardFill className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Payments</span>
                  </span>
                </Link>
              </li> */}
              <li className={
                      router.pathname === "/admin/users" ? "text-orange-default" : ""
                    }>
                <Link href="/admin/users">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0 `}
                  >
                    <FaUserFriends className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Users</span>
                  </span>
                </Link>
              </li>
              <li className={
                      router.pathname === "/admin/activity" ? "text-orange-default" : ""
                    }>
                <Link href="/admin/activity">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-0 `}
                  >
                    <MdOutlineTimeline className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Activity</span>
                  </span>
                </Link>
              </li>
             {/*  <li className={
                      router.pathname === "/admin/settings" ? "text-orange-default" : ""
                    }>
                <Link href="/admin/settings">
                  <span
                    className={`flex items-center rounded-xl font-bold text-md py-3 px-4 lg:pr-`}
                  >
                    <BiCog className={`text-xl lg:mr-4`} />
                    <span className="hidden lg:block">Settings</span>
                  </span>
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
        

          
      </div>
    </aside>
  );
};

export default AdminSidebar;
