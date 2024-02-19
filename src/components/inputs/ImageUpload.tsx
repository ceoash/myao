"use client";
import Image from "next/image";
import sha256 from "crypto-js/sha256";
import Button from "../dashboard/Button";
import axios from "axios";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import { useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { FaTimes, FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";

declare global {
  var cloudinary: any;
}
interface ImageUploadProps {
  onChange: (value: string) => void;
  value?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  let images = value ? JSON.parse(value) : [];

  const confirmation = useConfirmationModal();

  const handleDelete = async (image: string) => {
    try {
      const timestamp = new Date().getTime();
      const string = `public_id=${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}&timestamp=${timestamp}{process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY}`;
      const signature = await sha256(string);
      const data = {
        public_id: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        signature: signature,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        timestamp: timestamp,
      };
      await axios
        .post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${image}/destroy`,
          data
        )
        .then((response) => {
          toast.success("Image deleted");
        })
        .catch((error) => {
          toast.error("error deleting listing");
          console.log(error);
        });
    } catch (error) {}
  };

  const handleUpload = useCallback(
    (result: any) => {
      images.push(result.info.secure_url);
      const imageArray = JSON.stringify(images);
      onChange(imageArray);
    },
    [onChange, images]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CldUploadWidget
      onUpload={handleUpload}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: 5,
        sources: ["local", "url", "camera"],
        clientAllowedFormats: ["png", "jpeg", "jpg"],
      }}
    >
      {({ open }: any) => (
        <>
          {images.length < 5 ? (
            <div
              onClick={() => open?.()}
              className="flex flex-col items-center justify-center w-full  border border-gray-400 border-dashed rounded-lg bg-gray-50 h-full p-10 cursor-pointer relative"
            >
              <FaUpload size={40} className="" />
              <p className=" mb-6 mt-2">
                Drag and drop images to upload
              </p>
              <Button label="Select Images" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full  border border-gray-400 border-dashed rounded-lg bg-gray-50 h-full p-10 cursor-pointer relative">
              <p className=" mb-6 mt-2">
                You have reached the maximum number of images
              </p>
            </div>
          )}
          <div className="grid grid-cols-5 gap-4 mt-6">
            {images?.map((image: string, i: number) => (
              <div
                key={i}
                className="w-full h-full relative flex items-center justify-center border aspect-square bg-white "
              >
                <FaTimes
                  onClick={() => handleDelete(image)}
                  className="absolute top-0 right-0 text-white rounded-full border border-red-200 bg-red-500 p-1 text-xl shadow transition ease-in-out hover:opacity-70 m-2"
                />
                <Image
                  src={image}
                  alt="Upload"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </CldUploadWidget>
  );
};

export default ImageUpload;
