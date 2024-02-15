import Image from 'next/image'
import Link from 'next/link'
import cat from "@/images/cat-neutral.png";
import dog from "@/images/dog-neutral.png";
import avatar from "@/images/avatar.png";
import {useState } from 'react'
import { Session } from 'next-auth';

interface ISwap{
    participant: any;
    price: string | number | null | undefined;
    session: Session;
    completedBy: any;
    sellerId: string;
    buyerId: string;
    userId: string;
    meLastBid: any,
    participantLastBid: any
    status: string;
}
const Swap = ({
    participant,
    price,
    session,
    completedBy,
    sellerId,
    buyerId,
    userId , 
    meLastBid,
    participantLastBid,
    status
}: ISwap) => {
  const [ mostRecentBid, setMostRecentBid ] = useState<any>();
  const [ buttonClicked, setButtonClicked ] = useState("")

  const noBids = !meLastBid && !participantLastBid && status === "negotiating";
  const rejectedByMe = status === "rejected" && session?.user.id !== completedBy;
  const inNegotiation = status === "negotiating";


  const statusController = noBids || rejectedByMe || inNegotiation;


  return (
    <div>

<div className={`
        p-4 
        rounded-lg 
        shadow
        ${status === "accepted" && "bg-green-50 border-green-100"}
        ${status === "completed" && "bg-green-50 border-green-100"}
        ${status === "rejected" && "bg-red-50 border-red-100"}
        ${status === "cancelled" && "bg-red-50 border-red-100"}
        ${status === "negotiating" && "bg-white/20"}
        ${status === "awaiting approval" && "bg-white/20"}
      `}>
        {
          <Link
            href={"/dashboard/profile/" + session?.user.id}
            className="cursor-pointer"
          >
            <div className="">
              <div className="flex gap-3">
                <span className="w-[60px] xl:w-1/5">
                  <Image
                    src={avatar}
                    alt="user avatar"
                    className="rounded-full border border-orange-300 bg-white max-w-8"
                    width={60}
                    height={60}
                  />
                </span>
                <div className="w-full">
                  <div className="capitalize font-bold text-2xl flex justify-between items-center">
                    You
                    <Image
                      src={sellerId === session?.user.id ? dog : cat}
                      alt=""
                      className="h-8 w-10"
                    />
                  </div>
                  <div className="flex text-[12px]  xl:text-[14px] text-gray-600 gap-2">
                    {userId === session?.user.id && price !== '0' && price !== '' && (
                    <div>{price !== '0' && price !== '' && `Start price: £${price}`}</div>
                    )}
                    <div>{meLastBid?.price ? "Last offer: £" + Number(meLastBid.price).toLocaleString() : "No offers yet"}</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        }
      </div>

<div className={`
      p-4
      mt-4
      rounded-lg
      shadow
      ${status === "accepted" && "bg-green-50 border-green-100"}
      ${status === "completed" && "bg-green-50 border-green-100"}
      ${status === "rejected" && "bg-red-50 border-red-100"}
      ${status === "cancelled" && "bg-red-50 border-red-100"}
      ${status === "negotiating" && "bg-white/20 "}
      ${status === "awaiting approval" && "bg-white/20 "}
      `}>
        <Link href={"/dashboard/profile/" + participant?.id} className="cursor-pointer" >
          <div className="">
            <div className="flex gap-3">
              <span className="w-[60px] xl:w-1/5">
                <Image
                  src={participant?.profile?.image || avatar}
                  alt="user avatar"
                  className="rounded-full border border-orange-300"
                  width={60}
                  height={60}
                />
              </span>
              <div className="w-full">
                <div className="capitalize font-bold text-2xl flex justify-between items-center">
                  {participant?.username}
                  <Image
                    src={sellerId === participant?.id ? dog : cat}
                    alt=""
                    className="h-8 w-10"
                  />
                </div>
                <div className="flex gap-2 text-[12px]  text-gray-600 xl:text-[14px]">
                  {userId === participant?.id && price !== '0' && price !== '' && (
                    <div>{price !== '0' && price !== '' ? `Start price: £${price}` : ''}</div>
                  )}
                  <div>
                    {participantLastBid?.price
                      ? "Last offer: £" + Number(participantLastBid?.price).toLocaleString()
                      : "No offers yet"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
    </div>
  )
}

export default Swap