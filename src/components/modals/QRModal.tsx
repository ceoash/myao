"use client";

import Modal from "./Modal";
import Image from "next/image";
import useQRModal from "@/hooks/useQRModal";
import { handleCopy, handleDownloadQR } from "@/utils/canvas";
import { useQRCode } from "next-qrcode";
import { useSession } from "next-auth/react";
import { AppConfig } from "@/utils/AppConfig";
import { FaCopy, FaDownload } from "react-icons/fa";

export interface ErrorResponse {
  error: string;
}

const QRModal = () => {
  const { isOpen, onClose, image } = useQRModal();
  const { Canvas } = useQRCode();
  const { data: session } = useSession();

  let bodyContent = (
    <div className="rounded-lg mb-4 flex flex-col justify-center items-center w-full">
      <div className="rounded-lg border bg-gray-50 border-gray-200 px-2 py-2 flex gap-2  mb-8 items-center w-full">
        <div className="w-16 relative aspect-square items-center">
          <Image
            src={image || "/images/placeholders/avatar.png"}
            className="w-[60px] border border-gray-200 rounded-full bg-white p-1.5"
            alt="profile picture"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{session?.user.username}</h3>
          <p className="text-sm text-gray-500">
            {AppConfig.siteUrl.slice(8, AppConfig.siteUrl.length) || "http://localhost:3000"}/connect/
            {session?.user.username}
          </p>
        </div>
      </div>
      <div className="p-2 mx-6 border-12 relative items-center justify-center flex flex-col max-w-[280px]">
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
            className="strokeWidthgray-300/50 border border-gray-200 rounded-lg"
            strokeWidth="3"
          />
          <path
            d="M98,25 L98,2 L75,2"
            fill="none"
            className="stroke-gray-300/50 border border-gray-200 rounded-lg"
            strokeWidth="3"
          />
        </svg>
        <div className="p-2">

        <Canvas
          text={`${AppConfig.siteUrl || "http://localhost:3000"}/connect/${
            session?.user.username
          }`}
          options={{
            level: "M",
            margin: 2,
            scale: 4,
            width: 260,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          }}
        />
        </div>
        
      </div>
      <div className="max-w-[300px] pt-6  w-full">
        <h5>How to connect</h5>
          <p>
            Scan this QR code with your phone to connect with{" "}
            <span className="font-bold">{session?.user.username}</span>
          </p>

      </div>

      
    </div>
  );

  return (
    <Modal
      title="Share QR Code"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleDownloadQR}
      actionLabel={<div className="flex gap-1 items-center"><FaDownload /> Download QR</div>}
      secondaryAction={() => handleCopy(session?.user.username)}
      secondaryActionLabel={<div className="flex gap-1 items-center"><FaCopy /> Copy Link</div>}
      body={bodyContent}
      auto
      buttonsLeft
    />
  );
};

export default QRModal;
