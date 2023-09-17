import Image from 'next/image';
import { User } from '@prisma/client'

interface ProfileProps {
    image: string;
}

interface UserProps extends User{
    username: string;
    profile: ProfileProps;
}

interface InviterProps extends User {
    inviter: UserProps
    id: string;

}

const Inviter = ({inviter}: any) => {
   const {username, profile} = inviter
  return (
        <div className="flex gap-2.5 w-full  bg-gray-100 shadow mb-4 border border-gray-200 rounded-lg p-2">
          <div className="w-12 relative">
            <Image
              alt='=profile image'
              layout='fill'
              objectFit='cover'
              src={
                 profile && profile?.image ||
                "/images/placeholders/avatar.png"
              }
              className="rounded-full w-12 h-12 object-cover border-2 border-gray-200 p-[1px]"
            />
          </div>
          <div className="">
            <h4 className="-mb-1">{ username}</h4>
            <p className="text-sm font-bold text-orange-default">Buyer</p>
          </div>
        </div>
  )
}

export default Inviter