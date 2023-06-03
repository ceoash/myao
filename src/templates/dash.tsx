import React, { ReactNode, useCallback } from "react";

import { Session } from "next-auth";
import { useEffect, useState } from "react";

import Modal from "@/components/modals/Modal";
import UserMenu from "@/components/UserMenu";
import OfferModal from "@/components/modals/OfferModal";

import { getSession, useSession } from "next-auth/react";
import SearchModal from "@/components/modals/UserSearchModal";
import { Toaster } from "react-hot-toast";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { useRouter } from "next/navigation";


type IDashProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Dash = (props: IDashProps) => {
  const router = useRouter();

  const { data: session, status } = useSession();
  


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect to the login page if not authenticated
    }
  }, [status]);

  if (status === "loading") {
    // Show loading state if session is still being fetched
    return <div>Loading...</div>;
  }
  return (
    <div className="w-full min-h-screen bg-gray-50 px-1 text-gray-700 antialiased">
      {props.meta}
      <Toaster />
      <OfferModal  />
      <SearchModal  />
      <DeleteConfirmation  />
      <UserMenu />
      <main className="content flex flex-col h-full container mx-auto">
        {props.children}
      </main>
    </div>
  );
};

export { Dash };
