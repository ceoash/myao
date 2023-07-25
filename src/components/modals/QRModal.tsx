"use client";

import React from "react";
import Modal from "./Modal";
import useQRModal from "@/hooks/useQRModal";
import { handleCopy, handleDownloadQR } from "@/utils/canvas";
import { useQRCode } from "next-qrcode";
import { useSession } from "next-auth/react";
import Button from "../dashboard/Button";

export interface ErrorResponse {
  error: string;
}

const QRModal = () => {
  const { isOpen, onClose } = useQRModal();
  const { Canvas } = useQRCode();
  const { data: session } = useSession();

  let bodyContent = (
    <div className="border border-gray-200 rounded-lg mb-4 flex justify-center">
      <Canvas
        text={`$https://myao.vercel.app/connect/${session?.user.id}`}
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
  );

  return (
    <Modal
      title="Share QR Code"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleDownloadQR}
      actionLabel={"Download"}
      secondaryAction={() => handleCopy(session?.user.id)}
      secondaryActionLabel={"Copy"}
      body={bodyContent}
    />
  );
};

export default QRModal;
