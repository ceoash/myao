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

  const confirmation = useConfirmationModal()

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
       await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${image}/destroy`,
        data
      ).then((response) => {
        toast.success("Image deleted")
      }).catch((error) => {
        toast.error("error deleting listing")
        console.log(error)
      });
        
    } catch (error) {
      
    }
   

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
          <p className="text-neutral-400 mb-6 mt-2">
            Drag and drop images to upload
          </p>
          <Button label="Select Images" />
          <div className="grid grid-cols-4 gap-4 mt-6 rounded-lg">
            {images?.map((image: string, i: number) => (
              <div key={i} className="w-full h-full relative">
               <FaTimes onClick={() => handleDelete(image)} className="absolute top-0 right-0 text-white rounded-full border border-red-200 bg-red-400 text-xl shadow transition ease-in-out hover:text-2xl" />
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
        </div>
      )}
    </CldUploadWidget>
  );
};

export default ImageUpload;
