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
import QuickConnectModal from "@/components/modals/QuickConnectModal";
import PendingConversationModal from "@/components/modals/PendingConversationModal";
import RejectConversationModal from "@/components/modals/RejectConversationModal";
import Sidebar from "@/components/dashboard/Sidebar";

import { Router } from "next/router";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import QRModal from "@/components/modals/QRModal";
import SearchComponentModal from "@/components/modals/SearchModal";

type IDashProps = {
  meta: ReactNode;
  children: ReactNode;
  full?: boolean;
};

const Dash = (props: IDashProps) => {
  const nextrouter = Router;
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);
    nextrouter.events.on("routeChangeStart", handleStart);
    nextrouter.events.on("routeChangeComplete", handleComplete);
    nextrouter.events.on("routeChangeError", handleComplete);

    return () => {
      nextrouter.events.off("routeChangeStart", handleStart);
      nextrouter.events.off("routeChangeComplete", handleComplete);
      nextrouter.events.off("routeChangeError", handleComplete);
    };
  }, [nextrouter]);

  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  /* if (status === "loading") {
      return (
        <SkeletonTheme highlightColor="#edf2f7">
        <main className="content flex flex-col flex-grow">
          <div className="relative bg-white overflow-hidden flex-grow max-h-screen pt-16 min-h-screen">
            {
              !props.full && (
                <div className="sidebar-skeleton">
                  <Skeleton count={5} height={50} /> 
                </div>
              )
            }
      
            <div id="main" className={`${props.full ? "" : "md:ml-20 lg:ml-60"} max-h-screen overflow-y-auto`}>
              <div className={!props.full ? ` mt-8 md:mt-0` : `flex-grow flex-1 h-full`}>
                <div className="w-full mx-auto bg-white  sm:mt-1 h-full min">
                  <Skeleton count={10} height={50} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </SkeletonTheme>
      );
    
  }

  else if(loading){
    return (
       <SkeletonTheme highlightColor="#edf2f7">
     
        <main className="content flex flex-col flex-grow">
          <div className="relative bg-white overflow-hidden flex-grow max-h-screen pt-16 min-h-screen">
            {
              !props.full && (
                <div className="sidebar-skeleton">
                  <Skeleton count={5} height={50} /> 
                </div>
              )
            }
      
            <div id="main" className={`${props.full ? "" : "md:ml-20 lg:ml-60"} max-h-screen overflow-y-auto`}>
              <div className={!props.full ? ` mt-8 md:mt-0` : `flex-grow flex-1 h-full`}>
                <div className="w-full mx-auto bg-white  sm:mt-1 h-full min">
                  <Skeleton count={10} height={50} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </SkeletonTheme>
    )
  } */

  return (
    <div className="w-full h-screen bg-gray-50 px-1 text-gray-700 antialiased flex flex-col">
      {props.meta}
      <Toaster />
      <OfferModal />
      <MessageModal />
      <PendingConversationModal />
      <StartConversation />
      <QuickConnectModal />
      <ConfirmationModal />
      <SearchModal />
      <DeleteConfirmation />
      <RejectConversationModal />
      <QRModal />
      <SearchComponentModal />
      <UserMenu session={session} />
      <SkeletonTheme highlightColor="#edf2f7">
        <main className="content flex flex-col flex-grow">
          <div className="relative bg-white overflow-hidden flex-grow pt-16">
            {!props.full && <Sidebar />}
            <div
              id="main"
              className={`${
                props.full ? "" : "md:ml-20 lg:ml-60"
              } overflow-y-auto flex-grow`}
            >
              <div className="w-full mx-auto bg-white sm:mt-1 min-h-screen md:px-0">
                {props.children}
              </div>
            </div>
          </div>
        </main>
      </SkeletonTheme>
    </div>
  );
};
export { Dash };
