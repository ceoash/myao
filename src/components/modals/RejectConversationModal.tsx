"use client";

import { useState } from "react";
import Modal from "./Modal";
import axios from "axios";
import { useSocketContext } from "@/context/SocketContext";
import useRejectConversationModal from "@/hooks/useRejectConversationModal";

export interface ErrorResponse {
  error: string;
}

const RejectConversationModal = () => {
  const { isOpen, activeConversationState, onClose, setActiveConversationState, session } = useRejectConversationModal();
  const [blockUser, setBlockUser] = useState(false);

  const socket = useSocketContext();

  const handleStatus = async (status: string) => {
      const data = {
        conversationId: activeConversationState?.id,
        userBlockedId: blockUser ? session?.user.id : "",
        friendBlockedId: blockUser ? activeConversationState?.participant1Id === session?.user.id ? activeConversationState?.participant2Id : activeConversationState?.participant1Id : "",
        status: status,
      };
      try {
        const response = await axios.post("/api/conversations/status", data);
        setActiveConversationState((prev) => ({
          ...prev,
          status: status,
          blockedStatus: true,
        }));
        socket.emit("decline_conversation", response.data.conversation,);
        onClose();
        blockUser && socket.emit("block_user", response.data.newFriendshipBlock);
      } catch (error) {
      }
      return;
    }

  let bodyContent = (
    <>
    <div className="flex flex-col">
      Are you sure you want to decline this conversation?
    </div>

    <div className="flex gap-2">
      <input type="checkbox" className="mr-2" onChange={() => setBlockUser(!blockUser)} checked={!blockUser}/>
      <span>Just decline</span>
    </div>
    <div className="flex gap-2">
      <input type="checkbox" className="mr-2" onChange={() => setBlockUser(!blockUser)} checked={blockUser}/>
      <span>Decline and Block user</span>
    </div>

    </>
  );

  return (
    <Modal
      title="Decline conversation"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => handleStatus("declined")}
      actionLabel={"Decline"}
      secondaryAction={() => onClose()}
      secondaryActionLabel={"Cancel"}
      body={bodyContent}
    />
  );
};

export default RejectConversationModal;
