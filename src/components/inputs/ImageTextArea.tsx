import Image from "next/image";
import Button from "../dashboard/Button";
import { useCallback, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { BiImageAdd } from "react-icons/bi";


interface ImageTextAreaProps {
    onSubmit: (image: string, text: string) => void;
    disabled?: boolean; 
    isLoading?: boolean;
  }

interface FormValues {
  message: string;
}

const ImageTextArea: React.FC<ImageTextAreaProps> = ({ onSubmit, disabled, isLoading }) => {
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
    sources: ["local", "url", "camera"],
    
  }}
  
>
  {({ open }: any) => (
    <form onSubmit={handleFormSubmit} className="pb-4">
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
      <div className="relative mb-4">
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
      <Button
        submit
        className={`mt-4 px-4 py-2 bg-orange-default text-white rounded hover:bg-orange-default ${disabled && "opacity-50 cursor-not-allowed"}`}
        disabled={disabled || isLoading}
        isLoading={isLoading}
      >
        Send
      </Button>
    </form>
  )}
</CldUploadWidget>
  );
};

export default ImageTextArea;
