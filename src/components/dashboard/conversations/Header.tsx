import Button from "@/components/dashboard/Button";
import { Conversation, Listing } from "@prisma/client";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { BiCheck, BiDotsVerticalRounded, BiUserCheck, BiUserMinus, BiUserPlus, BiUserX } from "react-icons/bi";
import { BsSignDoNotEnterFill } from "react-icons/bs";
import { FaCheck, FaPlus, FaTimes, FaUserCheck, FaUserPlus, FaUserTimes } from "react-icons/fa";
import { MdDoNotDisturbAlt } from "react-icons/md";

interface HeaderProps {
  participant: any;
  username: string;
  activeConversationState: any;
  handleAccept: () => void;
  session: any;
  reject: any;
  setStatus: () => void;
  toggleDropdown: any;
  offerModal: any;
  setToggleDropdown: () => void;
  handleFollow: () => void;
  isFriend: any;
  handleBlocked: () => void;
  isBlocked: boolean;
  status: string;
}

const Header = ({
  participant,
  username,
  activeConversationState,
  handleAccept,
  session,
  reject,
  setStatus,
  toggleDropdown,
  offerModal,
  setToggleDropdown,
  handleFollow,
  isFriend,
  handleBlocked,
  isBlocked,
  status,
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
        <div className="flex leading-tight gap-2">
          <div className="text-xl font-medium flex items-center">
            <Link
              href={`/dashboard/profile/${participant}`}
              className="relative flex items-center space-x-2 ml-2"
            >
              <span className="text-gray-700 mr-3">{username}</span>
            </Link>
          </div>
          <button
            onClick={handleFollow}
            className={` border  rounded-lg  px-2 py-1 ${isFriend ? 'bg-orange-100 border-orange-200' : 'bg-white border-gray-200'}`}
          >
            { isFriend ? (
              <div className="flex gap-1 items-center">
              <FaUserCheck className=" text-orange-500" /> 
              <div className="hidden md:block text-orange-500 text-sm">Following</div>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
              <FaUserPlus className="" /> 
              <div className="hidden md:block text-sm">Add</div>
              </div>
              
            ) }
          </button> 
          <button
            onClick={handleBlocked}
            className={` border  rounded-lg  px-2 py-1 ${activeConversationState?.blockedStatus ? 'bg-red-100 border-red-200 text-red-500' : 'bg-white border-gray-200'}`}
          >
            { activeConversationState?.blockedStatus ? (
              <div className="flex gap-1 items-center">
              <FaUserTimes className=" " /> 
              <div className={`hidden md:block text-sm`}>Blocked</div>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
              <FaUserTimes className="" /> 
              <div className={`hidden md:block text-sm`}>Block</div>
              </div>
            )}
          </button> 
          
        </div>
      </div>
      <div className="flex items-center gap-2 relative">
        <div className="flex gap-2 relative">
          {status !== "declined" && (
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
                          activeConversationState?.id,
                          activeConversationState?.participant1Id ===
                            session.user.id
                            ? activeConversationState?.participant2Id
                            : activeConversationState?.participant1Id,
                          session.user,
                          setStatus
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
                  
                    onClick={() =>
                      offerModal.onOpen(
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
                    Create offer
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
        <div>
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
