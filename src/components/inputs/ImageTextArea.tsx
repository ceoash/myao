import React, { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { BiImageAdd, BiPaperclip } from "react-icons/bi";
import Button from "../dashboard/Button";


interface ImageTextAreaProps {
    onSubmit: (image: string, text: string) => void;
    disabled?: boolean; 
  }

interface FormValues {
  message: string;
}

const ImageTextArea: React.FC<ImageTextAreaProps> = ({ onSubmit, disabled }) => {
    const [textValue, setTextValue] = useState("");
    const [imageValue, setImageValue] = useState("");
  
    const handleUpload = useCallback((result: any) => {
      setImageValue(result.info.secure_url);
    }, []);
  
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(imageValue, textValue);
      setTextValue("");
      setImageValue("");
    };
  return (
    <CldUploadWidget
  onUpload={handleUpload}
  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
  options={{
    maxFiles: 1,
  }}
>
  {({ open }: any) => (
    <form onSubmit={handleFormSubmit}>
      <div className="flex items-center gap-2 my-4">
        <button
          type="button"
          className={`text-2xl text-gray-500 hover:text-gray-700${disabled && "opacity-50 cursor-not-allowed"}`}
          onClick={() => open?.()}
          disabled={disabled}
        >
          <BiImageAdd />
        </button>
       
      </div>
      <div className="relative">
        {imageValue && (
          <div className="absolute inset-0">
            <Image
              src={imageValue}
              alt="Uploaded Image"
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <textarea
          className="w-full h-40 p-2 border border-gray-300 rounded-lg resize-none"
          placeholder="Type your message..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="mt-2">
        <Button
        disabled={disabled}
        className={`mt-4 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-400 ${disabled && "opacity-50 cursor-not-allowed"}`}
      >
        Send
      </Button>
      </div>
      
    </form>
  )}
</CldUploadWidget>
  );
};

export default ImageTextArea;
