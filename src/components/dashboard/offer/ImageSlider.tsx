import React, { useEffect, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules
import SwiperCore, { Pagination, Thumbs, Navigation, FreeMode } from "swiper";

interface ImageSliderProps {
  images: string;
}

const ImageSlider = ({ images }: ImageSliderProps) => {
  const thumbsSwiperRef = useRef<SwiperCore | null>(null);
  const [imagesStore, setImagesStore] = useState([]);

  
  useEffect(() => {
    setImagesStore(() => {
      const newImages = JSON.parse(images)
      return newImages
    });
    
  }, []);

  return (
    <div className="relative flex-grow h-auto">
      <Swiper
        spaceBetween={10}
        thumbs={{ swiper: thumbsSwiperRef.current }}
        modules={[FreeMode, Navigation, Thumbs]}
        className=" mySwiper2 flex justify-center z-10 "
      >
        {imagesStore.map((image) => (
          <SwiperSlide>
            <img src={image} className="rounded-md"/>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute swiper-thumbs bottom-4 flex">

      <Swiper
        onSwiper={(swiper) => {
          thumbsSwiperRef.current = swiper;
        }}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mx-2"
      >
        {imagesStore.map((image) => (
          <SwiperSlide className="bg-white rounded-md" >
            <img src={image} className="" />
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
    </div>
  );
};

export default ImageSlider;
