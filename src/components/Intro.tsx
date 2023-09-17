import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

function Intro() {
  SwiperCore.use([Autoplay])

  return (
    <section className="section bg-gray-100">
      <div className="mb-10 text-center max-w-screen-md mx-auto">
        <p className="text-lg font-medium text-primary-default">
          Buy - Sell - Trade
        </p>
        <h2>
          Safely buy and sell products and services from £10 to £10 million or
          more
        </h2>
        <p className="font-light sm:text-xl">
          MYAO is a new way to buy and sell products and services. We are a
          marketplace that allows buyers and sellers to negotiate prices in a
          safe and secure environment.
        </p>
      </div>
      <div>
        <Swiper
          // install Swiper modules
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={
            {delay: 5000,}
          }
          loop={true}
          slidesPerView={'auto'}
          
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 30,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 30,
            },
          }}
      >
          <SwiperSlide>
            <div className="icon">
              <img className="max-w-[42px]" src="/icons/house-solid.png"></img>
            </div>
            <h4 className="text-center text-primary-default">Properties</h4>
          </SwiperSlide>
          <SwiperSlide>
            <div className="icon">
              <img
                className="max-w-[42px]"
                src="/icons/car-side-solid.png"
              ></img>
            </div>
            <h4 className="text-center text-primary-default">Vehicles</h4>
          </SwiperSlide>
          <SwiperSlide>
            <div className="icon">
              <img
                className="max-w-[42px]"
                src="/icons/lightbulb-solid.png"
              ></img>
            </div>
            <h4 className="text-center text-primary-default">Electronics</h4>
          </SwiperSlide>
          <SwiperSlide>
            <div className="icon">
              <img className="max-w-[42px]" src="/icons/image-solid.png"></img>
            </div>
            <h4 className="text-center text-primary-default">Art</h4>
          </SwiperSlide>
          <SwiperSlide>
            <div className="icon">
              <img className="max-w-[42px]" src="/icons/chair-solid.png"></img>
            </div>
            <h4 className="text-center text-primary-default">Furniture</h4>
          </SwiperSlide>
          <SwiperSlide>
            <div className="icon">
              <img className="max-w-[42px]" src="/icons/shirt-solid.png"></img>
            </div>
            <h4 className="text-center text-primary-default">Fashion</h4>
          </SwiperSlide>
          <SwiperSlide>
            <div className="icon">
              <img className="max-w-[42px]" src="/icons/music-solid.png"></img>
            </div>
            <h4 className="text-center text-primary-default">Music</h4>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

export default Intro;
