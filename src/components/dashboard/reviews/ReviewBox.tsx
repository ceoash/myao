import { Profile, Review, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BiStar } from "react-icons/bi";
import { BsFillStarFill } from "react-icons/bs";

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
    <article className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center mb-4 space-x-4">
        <Image
          className="w-10 h-10 rounded-full"
          src={
            review?.user?.profile?.image
              ? review?.user?.profile?.image
              : "/images/placeholders/avatar.png"
          }
          alt=""
          width={40}
          height={40}
        />
        <div className="space-y-1 font-medium">
          <p>
            {review?.user?.username}
            <time className="block text-xs text-gray-500">
              {new Date(review?.createdAt).toLocaleDateString("en-gb", {
                dateStyle: "long",
              })}
            </time>
          </p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        {Array.apply(null, Array(review.rating)).map((star) => (
          <BsFillStarFill className="inline-block text-orange-500" />
        ))}
      </div>

      <p className="mb-2 text-gray-500 dark:text-gray-400">{review.message}</p>
     
    </article>
  );
};

export default ReviewBox;
