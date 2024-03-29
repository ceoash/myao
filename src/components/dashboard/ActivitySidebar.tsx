import ActivityCard from "./ActivityCard";
import MessageCard from "./cards/MessageCard";
import NotificationCard from "./cards/NotificationCard";
import MenuItem from "../MenuItem";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useAlerts } from "@/hooks/AlertHook";
import axios from "axios";

interface SidebarProps {
  mobile?: boolean;
  toggle?: boolean;
  setToggle?: (mobile: boolean) => void;
  dashboard?: boolean;
}
const Sidebar = ({
  mobile,
  toggle,
  setToggle,
  dashboard
}: SidebarProps) => {
  const { data: session } = useSession();
  const [showMobile, setShowMobile] = useState(window.innerWidth <= 768);
  const alerts = useAlerts();

  const conversations = alerts.alerts?.conversations
  const activities = alerts.alerts?.activity;
  const notifications = alerts.alerts?.notifications;

  const ref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setToggle && setToggle(false);
    }
  };

  useEffect(() => {
    if (toggle) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggle]);

 

useEffect(() => {
  const handleResize = () => {
    setShowMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

  /* const notifications = [
    {
        id: "1",
        type: "profile",
        createdAt: "2021-08-01T00:00:00.000Z",
        message: "Update your profile",
        userId: "1",
    },
    {
        id: "2",
        type: "offer",
        createdAt: "2021-08-01T00:00:00.000Z",
        message: "You hav 5 pending offers",
        userId: "1",
    },
    {
        id: "3",
        type: "payment",
        createdAt: "2021-08-01T00:00:00.000Z",
        message: "Add a payment method",
        userId: "1",
    },

  ] */

  

  return (
    <div className={`transition-all
    duration-300
    ease-in-out
    absolute
    xl:fixed
    inset-y-0
    right-0
    h-screen
    w-full
    backdrop-blur-md
    bg-neutral-800/70
    flex
    z-40
    ${dashboard === true && "xl:bg-transparent xl:backdrop-blur-0 xl:w-auto"}`}>
      <aside
        className={`transition-all
        ease-in-out
        duration-300
        h-screen
        ml-auto
        w-auto
        inset-y-0
        right-0
        bg-white
        shadow-md
        max-h-screen
        ${dashboard === true && "xl:w-60 "}`}
      >
        {mobile && showMobile ? (
          <div 
          ref={ref}
          className="flex
          flex-col
          cursor-pointer
          z-50
          w-[250px]
          pt-20
          px-2
          ">
          <div className=" md:hidden">
            <MenuItem label="Home" link url={"/"} />
            <MenuItem label="Offers" link url={"/dashboard/trades"} />
            <MenuItem label="Friends" link url={"/dashboard/friends"} />
            <MenuItem
              label="Activity"
              link
              url={"/dashboard/activity"}
            />
            <MenuItem
              label="Settings"
              link
              url={"/dashboard/settings"}
            />
          </div>
          <>
            <MenuItem
              label="My Profile"
              link
              url={"/dashboard/my-profile"}
            />
            {/* <hr className="border-gray-200 mt-1" /> */}
            <MenuItem label="Logout" onClick={() => signOut()} />
          </>
        </div>
        ) : (
          <>
            <div ref={ref} className="flex flex-col flex-nowrap  h-full px-2">
              <div className=" pt-20 -mt-2 ">
                <div className="p-4 ">
                  <h5 className="mb-3">Notifications</h5>
                  <div className="space-y-4 flex flex-col">
                    {notifications && notifications.length > 0
                      ? notifications.map((notification) => (
                          <NotificationCard
                            key={notification.id}
                            {...notification}
                          />
                        ))
                      : "No notifications yet"}
                  </div>
                </div>
              </div>
              <div className="">
                <div className="p-4">
                  <h5 className="mb-3">Activities</h5>
                  <div className="space-y-1">
                    {activities && activities.length > 0
                      ? activities
                          .map((activity) => (
                            <ActivityCard
                              activity={activity}
                              key={activity.id}
                            />
                          ))
                          .reverse()
                      : "No activities yet"}
                  </div>
                </div>
              </div>
              <div className="">
                <div className="p-4">
                  <h5 className="mb-3">Conversations</h5>
                  <div className="space-y-1">
                    {conversations && conversations.length > 0
                      ? conversations.map((conversation) => (
                          <MessageCard
                            key={conversation.id}
                            id={conversation.id}
                            session={session}
                            participant1={{
                              id: conversation.participant1Id,
                              username: conversation.participant1.username,
                              profilePicture:
                                conversation.participant1?.profile?.image,
                            }}
                            participant2={{
                              id: conversation.participant2Id,
                              username: conversation.participant2.username,
                              profilePicture:
                                conversation.participant2?.profile?.image,
                            }}
                            message={conversation.directMessages[0] ? conversation.directMessages[0].text : "No messages yet"}
                          />
                        ))
                      : "No messages yet"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default Sidebar;
