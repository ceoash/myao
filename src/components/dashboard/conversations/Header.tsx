import { Conversation, Listing } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaCheck, FaTimes } from "react-icons/fa";

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
          <div className="flex flex-col leading-tight">
            <div className="text-xl font-medium flex items-center">
              <span className="text-gray-700 mr-3">{username}</span>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2 relative">
        <div className="flex gap-2 relative">
          {status !== "declined" && (
            <>
              {status === "none" &&
              activeConversationState?.participant2Id === session.user.id ? (
                <>
                  <button
                    onClick={handleAccept}
                    className="flex gap-1 items-center border border-gray-200 rounded-md px-2 py-1 text-sm bg-white"
                  >
                    <FaCheck /> Accept
                  </button>
                  {activeConversationState && (
                    <button
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
                      className="flex gap-1 items-center border border-gray-200 rounded-md px-2 py-2 text-md text-red-500 bg-white"
                    >
                      <FaTimes /> Decline
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
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
                    className="bg-orange-400 text-white rounded-md px-2 py-1 text-sm"
                  >
                    Create offer
                  </button>
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
              {isBlocked ? "Unblock" : "Block"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;