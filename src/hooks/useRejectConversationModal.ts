import { Conversation, IUser } from "@/interfaces/authenticated";
import { DirectMessage } from "@prisma/client";
import { Session } from "next-auth";
import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";


interface RejectConversation {
  isOpen: boolean;
  activeConversationState: Conversation;
  setActiveConversationState: Dispatch<SetStateAction<Conversation>>;
  session?: Session;
  recipientId?: string;
  onOpen: (
    activeConversationState: Conversation,
    session: Session,
    recipientId: string,
    setActiveConversationState: Dispatch<SetStateAction<Conversation>>
  ) => void;
  onClose: () => void;
}

const useRejectConversation = create<RejectConversation>((set) => ({
  isOpen: false,
  activeConversationState: {} as Conversation,
  setActiveConversationState: () => {},
  session: undefined,
  recipientId: "",
  onOpen: (
    activeConversationState: Conversation,
    session: Session,
    recipientId: string,
    setActiveConversationState: Dispatch<SetStateAction<Conversation>>
  ) => {
    set({
      isOpen: true,
      activeConversationState,
      setActiveConversationState,
      session,
      recipientId,
    });
    return;
  },
  onClose: () => {
    set({
      isOpen: false,
      session: undefined,
      recipientId: "",
      activeConversationState: undefined,
      setActiveConversationState: () => {},
    });
    return;
  },
}));

export default useRejectConversation;
