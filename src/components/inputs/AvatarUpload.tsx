"use client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { BiImageAdd, BiPlus } from "react-icons/bi";

declare global {
  var cloudinary: any;
}
interface ImageUploadProps {
  onChange: (value: string) => void;
  value?: string;
}
import React from "react";

const AvatarUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  const handleUpload = useCallback(
    (result: any) => {
      onChange(result.info.secure_url);
    },
    [onChange]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CldUploadWidget
      onUpload={handleUpload}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: 1,
      }}
    >
      {({ open }: any) => (
        <div
          onClick={() => open?.()}
          className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        border
                        border-neutral-200
                        border-dashed
                        h-full
                        p-10
                        cursor-pointer
                        relative
                        rounded-full
                        "
        >
          <BiPlus className="text-xl text-white absolute right-1 top-1 rounded-full bg-orange-500 z-10" />
          <Image
                  src={"/images/placeholders/avatar.png"}
                  alt="Upload"
                  fill={true}
                  style={{ objectFit: "cover" }}
                  className="rounded-full p-1"
                  
                />

          {value && (
            
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={value}
                  alt="Upload"
                  fill={true}
                  style={{ objectFit: "cover" }}
                  className="rounded-full"
                  
                />
              </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default AvatarUpload;
