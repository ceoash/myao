import { User } from "@prisma/client";
import axios from "axios";
import { set } from "date-fns";
import Link from "next/link";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BiCheckCircle, BiStar } from "react-icons/bi";
import Button from "./dashboard/Button";

interface ConnectProps {
  user: User;
}

const Connect = ({ user }: ConnectProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      email: "",
    },
  });

  const handleEmailSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/email/sendConnectEmail", {
        email: data.email,
        connectTo: {
          id: user.id,
          username: user.username,
        },
      });

      if (response.status === 200) {
        toast.success("Invitation sent!");
        setInvitationSent(true);
        reset();
      }
    } catch (err) {
      console.log("user not found");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="mx-auto w-full max-w-screen flex py-40 justify-center">

      {!invitationSent ? (
        <div className="border-2 border-gray-200 rounded-md p-6  shadow mb-6">
          <div className="">
            <div>
              <div className="flex flex-col gap-2 items-center mt-8">
                <img
                  src="/images/placeholders/avatar.png"
                  alt=""
                  className="border border-gray-200 rounded-full p-[1px] w-[200px] h-[200px] -mt-8"
                />
                <div className="flex mt-1">
                  <BiStar className="text-orange-500 text-2xl" />
                  <BiStar className="text-orange-500 text-2xl" />
                  <BiStar className="text-orange-500 text-2xl" />
                  <BiStar className="text-orange-500 text-2xl" />
                  <BiStar className="text-orange-500 text-2xl" />
                </div>
                <p className="text-2xl -mt-1 mb-6">
                  {user.username}
                </p>
              </div>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit(handleEmailSubmit)} className="mb-2">
              <div className="flex">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full border-2 border-gray-200 p-2 rounded-l-lg"
                  {...register("email", { required: true })}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-white p-2 rounded-r-lg text-sm"
                >
                  Connect
                </button>
              </div>
            </form>
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                We'll send you a link to join MYAO and connect to{" "}
                <span className="font-bold">{user.username}</span>
              </p>
            </div>
            
          </div>
          <div className="flex">
            
            <div className="text-center flex-1">
              <p className="font-bold text-sm">
                Alternatively, screenshot this for later.
              </p>
              <Link href="/sign-up" className="text-orange-500 font-bold">
                myao.life/sign-up
              </Link>

            </div>
            </div>
        </div>
      ) : (
          
        
        <div className="border-2 border-gray-200 rounded-md p-6  shadow mb-6">
          <div className="">
            <h2 className="text-center -mb-[1px]">Email Sent</h2>
            <div>
              <BiCheckCircle className="text-orange-400 text-[120px] mx-auto mb-4 mt-2" />
            </div>

            <p className="text-gray-600 text-sm text-center pt-2">
              We've sent a welcome email with a link for you to setup your account <br/>and connect with {user.username}.
              </p>
              <div className="mx-auto">
                <Button label="Go home" link="/" className="mt-4 mx-auto" />
              </div>
              
          </div>
        </div>
      )}
    </div>
  );
};

export default Connect;
