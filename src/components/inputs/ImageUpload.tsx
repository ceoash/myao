"use client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { BiImageAdd } from "react-icons/bi";

declare global {
  var cloudinary: any;
}
interface ImageUploadProps {
  onChange: (value: string) => void;
  value?: string;
}
import React from "react";
import { FaUpload } from "react-icons/fa";
import Button from "../dashboard/Button";

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  
  let images = value ? JSON.parse(value) : [];
  console.log("images", images);

  
  const handleUpload = useCallback(
    (result: any) => {
      images.push(result.info.secure_url);
      // Call onChange with all uploaded images
      const imageArray = JSON.stringify(images);

      onChange(imageArray);
    },
    [onChange, images]
  );// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CldUploadWidget
      onUpload={handleUpload}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: 5,
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
                        w-full 
                        border
                        border-gray-400
                        border-dashed
                        rounded-lg
                        bg-gray-50
                        h-full
                        p-10
                        cursor-pointer
                        relative"
        >
          <FaUpload size={40} className="text-neutral-400" />
          <p className="text-neutral-400 mb-6 mt-2">Drag and drop images to upload</p>
          <Button label="Select Images" />
          <div className="grid grid-cols-4 gap-4 mt-6 rounded-lg">
          { images?.map((image: string, i: number) => (
              <div className="w-full h-full">
                <Image
                  key={i}
                  src={image}
                  alt="Upload"
                  width={100}
                  height={100}
                  className="rounded-lg"  
                />
              </div>
            )
          )}

          </div>
        </div>
      )}
    </CldUploadWidget>
  );
};

export default ImageUpload;
