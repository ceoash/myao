import Button from "@/components/dashboard/Button";
import { IUser } from "@/interfaces/authenticated";
import { DirectMessage, Listing } from "@prisma/client";
import Link from "next/link";
import React, { Dispatch, use, useEffect, useState } from "react";
import { BiBlock, BiCheck, BiDotsVerticalRounded, BiUserCheck, BiUserMinus, BiUserPlus, BiUserX } from "react-icons/bi";
import { BsSignDoNotEnterFill } from "react-icons/bs";
import { FaCheck, FaPlus, FaTimes, FaUserCheck, FaUserPlus, FaUserTimes } from "react-icons/fa";
import { MdDoNotDisturbAlt } from "react-icons/md";
interface Conversation {
  id: string;
  participant1: IUser;
  participant2: IUser;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
  directMessages: DirectMessage[];
  friendStatus?: boolean;
  blockedStatus?: boolean;
  status?: string;
  currentUser?: any
}
interface HeaderProps {
  participant: any;
  username: string;
  activeConversationState: any;
  handleAccept: () => void;
  session: any;
  reject: any;
 
  toggleDropdown: any;
  offerModal: any;
  setToggleDropdown: () => void;
  handleFollow: () => void;
  isFriend: any;
  handleBlocked: () => void;
  isBlocked: boolean;
  setActiveConversationState: Dispatch<React.SetStateAction<Conversation | null>>;
}

const Header = ({
  participant,
  username,
  activeConversationState,
  handleAccept,
  session,
  reject,
  toggleDropdown,
  offerModal,
  setToggleDropdown,
  handleFollow,
  isFriend,
  handleBlocked,
  isBlocked,
  setActiveConversationState
}: HeaderProps) => {
  const [statusState, setStatusState] = useState("");

  useEffect(() => {
    setStatusState(activeConversationState?.status);
  }, [activeConversationState?.status]);

  return (
    <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 px-4 bg-gray-50">
      <div className="flex items-center">
        <Link
          href={`/dashboard/profile/${participant}`}
          className="relative flex items-center space-x-2"
        >
          <div className="relative">
            <img
              src="/images/placeholders/avatar.png"
              className="rounded-full border border-gray-200 p-1 h-[38px] my-2 ml-2"
            />
          </div>
        </Link>
        <div className="flex leading-tight gap-1 md:gap-2">
          <div className="text-xl font-medium flex items-center">
            <Link
              href={`/dashboard/profile/${participant}`}
              className="relative flex items-center space-x-2 ml-2"
            >
              <span className="text-gray-700 mr-3">{username}</span>
            </Link>
          </div>
          <Button
            onClick={handleFollow}
            accept={isFriend}
            className={` border rounded-lg  px-2 py-1 ${isFriend ? 'bg-orange-100 border-orange-200' : 'bg-white border-gray-200'}`}
          >
            { isFriend ? (
              <div className="flex gap-1 items-center">
              <FaCheck className="" /> 
              <div className="hidden md:block text-sm">Following</div>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
              <FaUserPlus className="" /> 
              <div className="hidden md:block text-sm">Add</div>
              </div>
              
            ) }
          </Button>
        
          <Button
            onClick={handleBlocked}
            cancel={activeConversationState?.blockedStatus}
            className={` border  rounded-lg  px-2 py-1 ${activeConversationState?.blockedStatus ? 'bg-red-100 border-red-200 text-red-500' : 'bg-white border-gray-200'}`}
          >
            { activeConversationState?.blockedStatus ? (
              <div className="flex gap-1 items-center">
              <BiBlock className=" " /> 
              <div className={`hidden md:block text-sm`}>Blocked</div>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
              <BiBlock className="" /> 
              <div className={`hidden md:block text-sm`}>Block</div>
              </div>
            )}
          </Button> 
          
        </div>
      </div>
      <div className="flex items-center gap-2 relative">
        <div className="flex gap-2 relative">
          {activeConversationState?.status !== "declined" && (
            <>
              {activeConversationState.status === "none" &&
              activeConversationState?.participant2Id === session.user.id ? (
                <>
                  <Button onClick={handleAccept}>
                    <FaCheck className="mr-2" /> Accept
                  </Button>
                  {activeConversationState && (
                    <Button
                      onClick={() =>
                        reject.onOpen(
                          activeConversationState,
                          activeConversationState?.id,
                          activeConversationState?.participant1Id ===
                            session.user.id
                            ? activeConversationState?.participant2Id
                            : activeConversationState?.participant1Id,
                          session,
                          setActiveConversationState
                        )
                      }
                    >
                      <FaTimes className="mr-2" /> Decline
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                  
                    onClick={() => session?.user?.id && offerModal.onOpen(
                        activeConversationState?.participant1Id ===
                          session.user.id
                          ? activeConversationState?.participant1
                          : activeConversationState?.participant2,
                        activeConversationState?.participant1Id ===
                          session.user.id
                          ? activeConversationState?.participant2
                          : activeConversationState?.participant1,
                        activeConversationState?.id
                      )
                    }
                  >
                    Create<span className="hidden md:block ml-1">offer</span>
                  </Button>

                  {/* 
                          <button
                            className="flex gap-1 items-center"
                            onClick={handleFollow}
                          >
                            {!isFriend ? (
                              <>
                                <BiUserCheck className="text-xl" /> Add user
                              </>
                            ) : (
                              <>
                                <BiUserMinus className="text-xl" /> Unfollow user
                              </>
                            )}
                          </button>
                          */}
                </>
              )}
            </>
          )}
          {/* 

              <div
                className="flex gap-1 items-center text-red-500"
                onClick={handleBlocked}
              >
                <BiBlock />
                {isBlocked ? "Unblock" : "Block"}{" "}
              </div>
              
              */}
        </div>
        <div className="hidden md:block">
          <BiDotsVerticalRounded
            className="text-2xl cursor-pointer"
            onClick={() => setToggleDropdown()}
          />
        </div>
        <div
          className={` right-0 top-8 ${toggleDropdown ? "absolute" : "hidden"}`}
        >
          <ul className="bg-gray-50 flex flex-col border border-gray-200 rounded-md shadow">
            <li
              onClick={handleFollow}
              className="border-b-2 border-gray-200 px-2 py-2 cursor-pointer"
            >
              {isFriend ? "Unfollow" : "Follow"}
            </li>
            <li onClick={handleBlocked} className="px-2 py-2 cursor-pointer">
              {activeConversationState?.blockedStatus ? "Unblock" : "Block"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
