import { Profile, Review, User } from "@prisma/client";
import React from "react";

interface IUser extends User {
  profile: Profile;
}
interface IReview extends Review {
  user: IUser;
}

interface ReviewProps {
  review: IReview;
}

const ReviewBox = ({ review }: ReviewProps) => {
  return (
    <article>
      <div className="flex items-center mb-4 space-x-4">
        <img
          className="w-10 h-10 rounded-full"
          src={
            review?.user?.profile?.image
              ? review?.user?.profile?.image
              : "/images/placeholders/avatar.png"
          }
          alt=""
        />
        <div className="space-y-1 font-medium dark:text-white">
          <p>
            {review.user.username}
            <time className="block text-sm text-gray-500 dark:text-gray-400">
              Joined on August 2014
            </time>
          </p>
        </div>
      </div>
      <div className="flex items-center mb-1">
        {Array.apply(null, Array(review.rating)).map((star) => (
          <svg
            className="w-4 h-4 text-yellow-300 mr-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
      </div>

      <p className="mb-2 text-gray-500 dark:text-gray-400">{review.message}</p>

      <a
        href="#"
        className="block mb-5 text-sm font-medium text-orange-300 hover:underline "
      >
        Read more
      </a>
     
    </article>
  );
};

export default ReviewBox;
