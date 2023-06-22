import React, { ReactNode, useEffect, useState } from "react";
import UserMenu from "@/components/UserMenu";
import OfferModal from "@/components/modals/OfferModal";
import SearchModal from "@/components/modals/UserSearchModal";
import MessageModal from "@/components/modals/MessageModal";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import StartConversation from "@/components/modals/StartConversation";
import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import getCurrentUser from "@/actions/getCurrentUser";
import { SafeUser } from "@/types";
import QuickConnectModal from "@/components/modals/QuickConnectModal";
import PendingConversationModal from "@/components/modals/PendingConversationModal";

type IDashProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Dash = (props: IDashProps) => {
  const router = useRouter();

  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  

  if (status === "loading") {
    // Show loading state if session is still being fetched
    return <div>Loading...</div>;
  }
  return (
    <div className="w-full h-screen bg-gray-50 px-1 text-gray-700 antialiased flex flex-col">
      {props.meta}
        <Toaster />
        <OfferModal  />
        <MessageModal  />
        <PendingConversationModal />
        <StartConversation />
        <QuickConnectModal />
        <SearchModal  />
        <DeleteConfirmation  />
        <UserMenu session={session} />
      <main className="content flex flex-col flex-grow container mx-auto overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch">
        {props.children}
      </main>
    </div>
  );
};
export { Dash };
