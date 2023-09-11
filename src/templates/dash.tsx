import React, { ReactNode, useEffect, useRef, useState } from "react";
import UserMenu from "@/components/UserMenu";
import OfferModal from "@/components/modals/OfferModal";
import MessageModal from "@/components/modals/MessageModal";
import StartConversation from "@/components/modals/StartConversation";
import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import QuickConnectModal from "@/components/modals/QuickConnectModal";
import PendingConversationModal from "@/components/modals/PendingConversationModal";
import RejectConversationModal from "@/components/modals/RejectConversationModal";
import Sidebar from "@/components/dashboard/Sidebar";
import { usePathname } from "next/navigation";
import { Router } from "next/router";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import QRModal from "@/components/modals/QRModal";
import SearchComponentModal from "@/components/modals/SearchModal";
import OfferEditModal from "@/components/modals/OfferEditModal";
import ActivitySidebar from "@/components/dashboard/ActivitySidebar";
import { useAlerts } from "@/hooks/AlertHook";
import Link from "next/link";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";

type IDashProps = {
  meta: ReactNode;
  pageTitle?: string;
  children: ReactNode;
  full?: boolean;
  dashboard?: boolean;
  optionalData?: any;
  noBreadcrumbs?: boolean;
};

export interface ErrorResponse {
  error: string;
}

const Dash = (props: IDashProps) => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const alerts = useAlerts();
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [toggleMobileSidebar, setToggleMobileSidebar] = useState(false);
  const nextrouter = Router;
  const router = useRouter();
  const pathname = usePathname();
  const handleToggle = (mobile?: boolean) => {
    setToggleMobileSidebar((prev) => {
      return mobile || false;
    });
    setToggleSidebar(!toggleSidebar);
    if (window.innerWidth <= 768) {
      setDisabled(toggleSidebar);
    }
  };

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (e: any) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setToggleSidebar(false);
    }
  };

  useEffect(() => {
    if (toggleSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleSidebar]);

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

  useEffect(() => {
    const handleResize = () => {
      if (pathname === "/dashboard") {
        setToggleSidebar(window.innerWidth >= 1280);
      }
    };
    // Initial check
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    <div
      className={`w-full h-screen bg-gray-50 text-gray-700 antialiased flex flex-col ${
        toggleSidebar && "overflow-hidden xl:overflow-auto"
      }`}
    >
      {props.meta}
      <Toaster />
      <OfferModal />
      <MessageModal />
      <PendingConversationModal />
      <StartConversation />
      <QuickConnectModal />
      <ConfirmationModal />
      <RejectConversationModal />
      <OfferEditModal />
      <QRModal />
      <SearchComponentModal />
      <UserMenu
        session={session}
        blockedUsers={alerts.alerts?.blockedUsers}
        setToggle={handleToggle}
        toggle={toggleSidebar}
      />
      <SkeletonTheme highlightColor="#edf2f7">
        <main className="content flex flex-col flex-grow">
          <div className="relative bg-gray-50 overflow-hidden flex-grow pt-16">
            {!props.full && <Sidebar />}
            <div
              id="main"
              className={`
              transition-all duration-200 ease-in-out
              bg-gray-50
              ${props.full ? "" : "md:ml-20 lg:ml-60"} 
              ${props.dashboard && toggleSidebar && "xl:mr-60"}
              overflow-y-auto h-full`}
            >
              {!props.noBreadcrumbs && (
                <div
                  className={`flex justify-between gap-2 mx-4 lg:mx-8 mt-6  lg:mt-6  ${
                    props.dashboard ? "sm:mx-4 mb-4" : "mx-6 md:mx-6 lg:mx-8"
                  }  lg:mb-0 items-center`}
                >
                  <Breadcrumbs
                    pageTitle={props.pageTitle}
                    dashboard={props.dashboard}
                  />
                  {props.optionalData}
                </div>
              )}
              <div className="w-full mx-auto bg-gray-50 h-full md:px-0">
                {props.children}
              </div>
            </div>
            {toggleSidebar && (
              <ActivitySidebar
                mobile={toggleMobileSidebar}
                toggle={toggleSidebar}
                setToggle={setToggleSidebar}
                dashboard={props.dashboard === true ? true : false}
              />
            )}
          </div>
        </main>
      </SkeletonTheme>
    </div>
  );
};
export { Dash };
