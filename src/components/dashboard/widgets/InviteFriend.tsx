import Input from "@/components/inputs/Input";
import React from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Button from "../Button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User } from "@prisma/client";

interface InviteFriendProps {
  className?: string;
  user: User;
}

const InviteFriend = ({ className, user}: InviteFriendProps) => {

  const { register, clearErrors, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      email: ""
    }
  });

  const onSubmit: SubmitHandler<FieldValues>  = async (data: any) => {

    try {

      data.username = user?.username
      data.userId = user?.id
  
      await axios.post('/api/email/sendInviteEmail', data)
      toast.success("Inviation sent")
      reset
    } catch (error) {
      
    }
  }
  return (
    <div
      className={`rounded-xl border bg-orange-50 border-orange-100 mb-6  p-6 xl:flex-1 ${
        className && className
      }`}
    >
      <div className="  items-center justify-between gap-2 mb-4">
        <h3>Invite a friend</h3>
        <p>Know a friend who'd enjoy our platform? Invite them</p>
      </div>
      <div className="flex flex-nowrap">
        <form onChange={() => clearErrors} className="w-full">
          <Input
            id="email"
            type="email"
            register={register}
            placeholder="Enter the invitees email address"
            inline={true}
            onClick={handleSubmit(onSubmit)}
            btnText="Invite"
          />
         
        </form>
      </div>
    </div>
  );
};

export default InviteFriend;
