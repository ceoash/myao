import { useEffect, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"
import catPlaceholder from "@/images/cat-placeholder.png";
import dogPlaceholder from "@/images/dog-placeholder.png";

// Import Swiper styles
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import plus from "@/images/plus.svg";

// import required modules
import SwiperCore, { Thumbs, Navigation, FreeMode } from "swiper";
import Image from "next/image";
import { ImUpload3 } from "react-icons/im";
import { RiImageAddFill } from "react-icons/ri";


interface ImageSliderProps {
  images: string;
  handleAddImages: () => void;
  listingType?: string;
}

const ImageSlider = ({ images, handleAddImages, listingType }: ImageSliderProps) => {
  const thumbsSwiperRef = useRef<SwiperCore | null>(null);
  const [imagesStore, setImagesStore] = useState([]);

  useEffect(() => {
    setImagesStore(() => {
      let newImages;
      if (images) {
        newImages = JSON.parse(images);
      } else {
        newImages = [];
      }

      return newImages;
    });
  }, [images]);

  return (
    <div className="relative overflow-auto flex-grow h-auto flex flex-col  ">
      <Swiper
        spaceBetween={10}
        thumbs={{ swiper: thumbsSwiperRef.current }}
        modules={[FreeMode, Navigation, Thumbs]}
        className=" mySwiper2 flex  z-10 mx-0 mb-6 flex-1"
      >
        {imagesStore && imagesStore.length > 0 ? imagesStore.map((image, i) => (
          <SwiperSlide
            key={i}
            className="relative h-full aspect-video bg-gray-50 border-x border-t rounded"
          >
            <Image
              alt=""
              src={image}
              className="rounded-md bg-white"
              objectFit="contain"
              layout="fill"
            />
          </SwiperSlide>
        )) :  <SwiperSlide className="relative h-full aspect-video bg-gray-50 border-x border-t rounded" >

          <Image src={listingType && listingType === "buyer" ? catPlaceholder : dogPlaceholder } alt=""  /> 
        </SwiperSlide>
        
        }
      </Swiper>

      <div className="p-2 bg-white border flex justify-between ">
        <Swiper
          onSwiper={(swiper) => {
            thumbsSwiperRef.current = swiper;
          }}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="flex z-20 mx-0 "
        >
          {imagesStore.map((image, i) => (
            <SwiperSlide
              key={i}
              className="bg-white rounded-md border border-gry-200 z-30 aspect-square"
            >
              <Image
                alt=""
                src={image}
                className="aspect-square rounded border"
                width={90}
                height={90}
              />
            </SwiperSlide>
          ))}
         
        </Swiper>
        {imagesStore.length < 5 && (
            <div
              className="bg-white rounded-md border border-gry-200 z-30 aspect-square flex justify-center items-center"
              onClick={handleAddImages}
            >
              <RiImageAddFill className="text-6xl text-gray-300" />
            </div>
          )}
      </div>
    </div>
  );
};

export default ImageSlider;
