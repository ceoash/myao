import { timeSince } from "@/utils/formatTime";
import Image from "next/image";
import React from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

interface SidebarProps {
  isOpen: boolean;
  handleSidebarToggle: () => void;
  filterBlockedConversation: any;
  handleSetActiveConversation: (conversation: any) => void;
  activeConversationState: any;
  session: any;
}

const Sidebar = ({
  isOpen,
  handleSidebarToggle,
  filterBlockedConversation,
  handleSetActiveConversation,
  activeConversationState,
  session,
}: SidebarProps) => {
  return (
    <>
      <div className={`py-5 px-4 absolute ${isOpen ? "-right-8" : "-left-8"} `}>
        <button
          onClick={handleSidebarToggle}
          className="
                    top-[50%] 
                    bottom-[50%] 
                    mt-1 
                    bg-orange-300 
                    text-white 
                    rounded-full 
                    px-1 
                    py-1 
                    text-xl 
                    flex 
                    items-center 
                    border 
                    border-white
                  "
        >
          {isOpen ? <BiChevronLeft /> : <BiChevronRight />}
        </button>
      </div>
      <div className={`${isOpen ? "block" : "hidden"} `}>
        {filterBlockedConversation.map((conversation: any) => {
          return (
            <div
              key={conversation.id}
              className={`border-b border-gray-200 p-4 flex gap-4 ${
                conversation.id === activeConversationState?.id
                  ? "bg-orange-50"
                  : "bg-white"
              }`}
              onClick={() => handleSetActiveConversation(conversation)}
            >
              <div className="w-10">
                {conversation.participant1Id === session?.user?.id ? (
                  <Image
                    src={
                      conversation?.participant2?.profile?.image ||
                      "/images/placeholders/avatar.png"
                    }
                    className={`rounded-full  ${
                      conversation.id === activeConversationState?.id
                        ? "border border-orange-200"
                        : `border border-gray-200`
                    } `}
                    width={100}
                    height={100}
                    alt=""
                  />
                ) : (
                  <Image
                    src={
                      conversation?.participant1?.profile?.image ||
                      "/images/placeholders/avatar.png"
                    }
                    className={`rounded-full h-10 w-10 ${
                      conversation.id === activeConversationState?.id
                        ? "border border-orange-200"
                        : `border border-gray-200`
                    } `}
                    height={100}
                    width={100}
                    alt={``}
                  />
                )}
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center w-full">
                  <div className={`font-bold flex-1`}>
                    {conversation.participant1Id === session?.user?.id
                      ? conversation.participant2?.username
                      : conversation.participant1?.username}
                  </div>
                  <div className="ml-auto text-xs italic">
                    {timeSince(conversation.updatedAt, true)}
                  </div>
                </div>
                <div className={`text-sm truncate ...`}>
                  {conversation.directMessages.length === 0 ||
                  conversation.directMessages[
                    conversation.directMessages.length - 1
                  ].text === ""
                    ? conversation.directMessages[
                        conversation.directMessages.length - 1
                      ]?.image
                      ? "image uploaded"
                      : "No messages yet"
                    : conversation.directMessages[
                        conversation.directMessages.length - 1
                      ].text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
