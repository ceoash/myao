import { useEffect, useState } from "react";

import axios from "axios";
import Button from "./dashboard/Button";
import Spinner from "./Spinner";

import { User } from "@prisma/client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BiCheckCircle,BiStar } from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa";

interface ConnectProps {
  user: User;
}

const Connect: React.FC<ConnectProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [date, setDate] = useState("");

  const {data: session, status} = useSession();
  const route = useRouter();

  useEffect(() => {
    const newDate = new Date(user.createdAt).toLocaleDateString();
    setDate(newDate);
  }, [user.createdAt])
  
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      email: "",
    },
  });
  
  const handleEmailSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    setIsLoading(true);
    if(session && status === "authenticated") {
      route.push(`/dashboard/profile/${user.id}`);
      return null;
    }
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
    <>
      <div className="text-gray-600  w-full p-4 mt-6 mb-0 text-xs border rounded-lg border-gray-200 bg-white max-w-sm">
        <p className="font-bold text-lg">
          {invitationSent
            ? `Check your inbox`
            : `Connect with ${user.username}`}
        </p>
        <p className=" ">
          {invitationSent
            ? `We've sent a welcome email with a link for you to setup your account and connect with ${user.username}`
            : `Connect with ${user.username} to see their profile and get started`}
        </p>
      </div>
      <div className="max-w-sm w-full mt-6 m-auto lg:mt-6 flex flex-col bg-gray-200 rounded-3xl items-center border border-gray-200co">
        <>
          <div className="p-1 relative mx-auto w-32 border border-gray-300 rounded-full bg-white my-8 ">
            <span className="absolute right-0 m-3 h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-300 ring-offset-2"></span>
            <img
              className="mx-auto h-auto w-full rounded-full"
              src={"/images/placeholders/avatar.png"}
              alt=""
            />
          </div>
          <div className="bg-white rounded-b-3xl w-full flex flex-col">
            <h2 className="text-center text-gray-800 text-2xl font-bold pt-6">
              {user.username}
            </h2>
            <p className="text-center text-gray-500 text-xs italic -mt-4">
              Member since {date}
            </p>
            <div className="text-xl text-gray-400 mb-4 px-4 mx-auto">
              <BiStar className="inline-block text-orange-500" />
              <BiStar className="inline-block text-orange-500" />
              <BiStar className="inline-block text-orange-500" />
              <BiStar className="inline-block text-orange-500" />
              <BiStar className="inline-block text-orange-500" />
            </div>

            {!invitationSent ? (
              <>
                <div className="px-6">
                  <div className="flex flex-nowrap">
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full border bg-gray-50 border-gray-300 text-gray-700 rounded-l-lg px-3 py-2 flex-1 h-18"
                      placeholder="Your Email"
                    />
                    <button
                      onClick={handleSubmit(handleEmailSubmit)}
                      className="bg-gray-800 hover:bg-orange-hover text-white border border-gray-200 font-bold py-2 px-4 rounded-r-lg w-auto"
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : (
                        <FaChevronRight />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-center m-auto mt-6 w-full h-16">
                  <button onClick={route.back} className="text-gray-500 font-bold lg:text-sm hover:text-gray-900">
                    Go back
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center m-auto w-full mb-12">
                <BiCheckCircle className="text-orange-default text-[60px] mx-auto mb-8 mt-2" />

                <div className="mx-auto">
                  <Button
                    label="Go back"
                    link="/"
                    className="mt-4 mx-auto"
                    primary
                    onClick={route.back}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      </div>
    </>
  );
};

export default Connect;
