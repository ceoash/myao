import Input from "@/components/inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User } from "@prisma/client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BiChevronRight } from "react-icons/bi";

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
      className={`rounded-xl border bg-white border-gray-200 mb-6  p-6 xl:flex-1 ${
        className && className
      }`}
    >
      <div className="items-center justify-between gap-2 mb-4">
        <h4>Invite a friend</h4>
        <p>Know a friend who'd enjoy our platform? Invite them</p>
      </div>
      <div className="flex flex-nowrap">
        <form onChange={() => clearErrors} className="w-full">
          <Input
            id="email"
            type="email"
            name="email"
            register={register}
            placeholder="joe@myao.life"
            inline={true}
            onClick={handleSubmit(onSubmit)}
            btnText={<BiChevronRight className="text-2xl" />}
          />
         
        </form>
      </div>
    </div>
  );
};

export default InviteFriend;
