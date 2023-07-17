"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useRejectConversationModal from "@/hooks/useRejectConversationModal";
import axios from "axios";
import {io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { config } from "@/config";
import { Socket } from 'socket.io-client';

export interface ErrorResponse {
  error: string;
}

const RejectConversationModal = () => {
  const { isOpen, conversationId, onClose, onOpen, setStatus, session, recipientId} = useRejectConversationModal();
  const socketRef = React.useRef<Socket | null>(null);
  const [blockUser, setBlockUser] = useState(false);

  const handleDecline = async () => {
    if (blockUser) {
      try {
        const response = await axios.post("/api/conversations/declineBlock", {
          conversationId: conversationId,
          user: session?.user.id,
          user2: recipientId,
        });
        toast.error("Declined and blocked");
        setStatus("blocked");
        socketRef.current?.emit("decline_conversation", response.data.conversation);
        onClose();
        socketRef.current?.emit("block_user", response.data.newFriendshipBlock);
      } catch (error) {
        toast.error("failed to decline and block user");
      }
      return;
    }
    
    try {
      const response = await axios.post("/api/conversations/decline", {
        conversationId: conversationId,
      });
      toast.error("declined");
      setStatus("declined"); 
      onClose();
      socketRef.current?.emit("decline_conversation", response.data);
    } catch (error) {
      toast.error("failed to decline conversation");
    }
  };

  useEffect(() => {
    socketRef.current = io(config.PORT || 'https://myao-add-1fcc5262bac8.herokuapp.com');
    return () => {
      socketRef.current?.disconnect();
    };
  } ,[]);



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
      onSubmit={() => handleDecline()}
      actionLabel={"Decline"}
      secondaryAction={() => onClose()}
      secondaryActionLabel={"Cancel"}
      body={bodyContent}
    />
  );
};

export default RejectConversationModal;
