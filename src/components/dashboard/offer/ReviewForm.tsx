import React, { useState } from "react";
import Button from "../Button";
import TextArea from "@/components/inputs/TextArea";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { error } from "console";
import { toast } from "react-hot-toast";
import { RegisterOptions } from "react-hook-form";
import { Profile, Review, User } from "@prisma/client";

interface IUser extends User {
  profile: Profile;
}
interface IReview extends Review {
  user: IUser;
}

interface ReviewProps {
  review: IReview;
}

interface ReviewFormProps {
  listingId: string;
  sellerId: string;
  buyerId: string;
  sessionId: string;
  disabled?: boolean;
  setReviews: React.Dispatch<React.SetStateAction<{userReview: IReview, participantReview: IReview }>>;
  ownerId: string;
  username?: string;
}

const ReviewForm = ({
  listingId,
  sellerId,
  buyerId,
  sessionId,
  disabled,
  setReviews,
  ownerId,
  username,
}: ReviewFormProps) => {

  const [rating, setRating] = useState(0)

  const { register, handleSubmit, clearErrors, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      rating: 0,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data: any, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    data.listingId = listingId;
    data.userId = sessionId;
    data.rating = Number(rating);
    
    const res = axios
      .post("/api/submitReview", data)
      .then((result) => {
        toast.success(result.data.review.message);
        reset();
        setValue("rating", 0);
        setRating(0);
        setReviews((prev) => {
          return { ...prev, userReview: {...result.data.review, user: { username: username } } };
        });
      })
      .catch((error) => {
        console.log(error);
      });
    
  };
  return (
    <div className="p-4 bg-orange-50 border rounded-lg border-orange-200 mb-4">
      <h4 className="mb-2">Leave a review</h4>
      <p className="mb-2">How would you rate your experience?</p>
      <form onChange={() => clearErrors}>
        <div className="flex gap-6 mb-4">
          <div className="flex flex-col">
            
            <input
              id="rating"
              type="radio"
              className="text-orange-400"
              value={1}
              {...register("rating")}
              onChange={(e) => setRating(Number(e?.target?.value))}
              checked={rating === 1 ? true : false }
            />
            Very bad
          </div>
          <div className="flex flex-col">
            <input
              id="rating"
              type="radio"
              className="text-orange-400"
              value={2}
              {...register("rating")}
              onChange={(e) => setRating(Number(e?.target?.value))}
              checked={rating === 2 ? true : false }
            />
            bad
          </div>
          <div className="flex flex-col">
            <input
              id="rating"
              type="radio"
              className="text-orange-400"
              value={3}
              {...register("rating")}
              onChange={(e) => setRating(Number(e?.target?.value))}
              checked={ rating === 3 ? true : false }
            />
            Neutral
          </div>
          <div className="flex flex-col">
            <input
              id="rating"
              type="radio"
              className="text-orange-400"
              value={4}
              {...register("rating")}
              onChange={(e) => setRating(Number(e?.target?.value))}
              checked={ rating === 4 ? true : false }
            />
            Good
          </div>
          <div className="flex flex-col">
            <input
              id="rating"
              type="radio"
              className="text-orange-400"
              value={5}
              {...register("rating")}
              onChange={(e) => setRating(Number(e?.target?.value))}
              checked={ rating === 5 ? true : false }
            />
            Amazing
          </div>
        </div>
        <TextArea
          id="message"
          placeholder="Write a review.."
          register={register}
        />
        <Button onClick={handleSubmit(onSubmit)} label="Submit" />
      </form>
    </div>
  );
};

export default ReviewForm;
