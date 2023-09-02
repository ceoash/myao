import React, { useEffect, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import plus from "@/images/plus.svg"

// import required modules
import SwiperCore, { Pagination, Thumbs, Navigation, FreeMode } from "swiper";
import Image from "next/image";
import { OfferModalStore } from "@/interfaces/authenticated";
import { FaPlus } from "react-icons/fa";

interface ImageSliderProps {
  images: string;
  handleAddImages: () => void
}

const ImageSlider = ({ images, handleAddImages }: ImageSliderProps) => {
  const thumbsSwiperRef = useRef<SwiperCore | null>(null);
  const [imagesStore, setImagesStore] = useState([]);
  
  useEffect(() => {
    setImagesStore(() => {
      let newImages;
      if (images) {
         newImages = JSON.parse(images)
      }
      else {
        newImages = [];
      }
     
      return newImages
    });
    
  }, []);

  return (
    <div className="relative overflow-auto flex-grow h-auto">
      <Swiper
        spaceBetween={10}
        thumbs={{ swiper: thumbsSwiperRef.current }}
        modules={[FreeMode, Navigation, Thumbs]}
        className=" mySwiper2 flex justify-center z-10 "
      >
        {imagesStore.map((image, i) => (
          <SwiperSlide key={i} className="relative h-full aspect-video bg-gray-50">
            <Image alt="" src={image} className="rounded-md bg-white" objectFit="contain" layout="fill" />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={(swiper) => {
          thumbsSwiperRef.current = swiper;
        }}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mx-2  z-50 w-full bottom-0"
      >

        {imagesStore.map((image, i) => (
          <SwiperSlide key={i} className="bg-white rounded-md border border-gry-200 z-50" >
            <img src={image} className="" />
          </SwiperSlide>
          
        ))}
        <SwiperSlide key={"0"} className="bg-white rounded-md border border-gry-200 z-50" onClick={handleAddImages} >
            <Image src={plus} layout="fill" objectFit="cover" alt="plus icon" className="text-gray-300" />
          </SwiperSlide>
      </Swiper>
      </div>
  );
};

export default ImageSlider;
