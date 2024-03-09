import { randomUUID } from "crypto";
import MenuItem from "../MenuItem";
import { useEffect, useRef, useState } from "react";
import { FaChevronRight } from "react-icons/fa";

interface TabsProps {
  setTab: (tab: string) => void;

  tabs: {
    id: string;
    label: string;
    primary?: boolean;
    notificationsCount?: number;
  }[];
  lg?: boolean;
  uppercase?: boolean;
  status?: string;
  tab: string;
  isListing?: boolean;
  main?: boolean;
  additionalData?: any;
  mobileLinks?: any;
  className?: string;
  count?: {
    messages?: {
      total: number;
      unread: number;
    };
  };
  setCount?: React.Dispatch<React.SetStateAction<number>>;
  model?: {
    id: string;
    title: string;
  };
}

const Tabs = ({
  setTab,
  tabs,
  status,
  tab: activeTab,
  isListing,
  main,
  additionalData,
  mobileLinks,
  count,
 setCount,
  model,
  className,
}: TabsProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const markReasAsRead = async () => {
    if (!model?.id) return;
    try {
      const res = await fetch("/api/messages/markAsRead", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: model?.id || "",
          read: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Messages marked as read");
        setCount && setCount(0);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const changeTab = (tab: string) => {
    if (tab === "chat") {
      markReasAsRead();
    }
    setTab(tab);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <ul
      key={tabs[0].label + tabs[tabs.length - 1].id}
      className={`flex  flex-wrap text-md font-medium text-center text-gray-700 border-b border-gray-200 relative items-center ${
        className ? className : ""
      }`}
    >
      {main && (
        <li
          key={"trade"}
          onClick={() => setTab("trade")}
          className={`
            cursor-pointer 
            
            rounded-t-lg active
            px-2.5
            sm:px-3
            text-sm
            md:px-4 py-3
            inline-block
            whitespace-nowrap
            xl:hidden
            border-gray-20
            font-medium

            
            ${
              activeTab === "trade"
                ? " border-b-2 border-orange-400 text-orange-600"
                : "bg-white"
            }
          }`}
        >
          <span>Trade</span>
        </li>
      )}
      {tabs.map((tab, i) => {
        if (
          status !== "awaiting approval" &&
          status !== "haggling" &&
          tab.id === "chat"
        )
          return null;
        return (
          <div key={i} className="relative ">
            {tab.notificationsCount && tab.notificationsCount > 0 ? (
              <div className="absolute -top-1 -right-1 bg-orange-default text-white px-1.5 text-xs font-bold rounded-full z-20">
                {tab.notificationsCount}
              </div>
            ) : (
              ""
            )}
            <div
              onClick={() => changeTab(tab.id)}
              className={`
                cursor-pointer 
                md:px-4 py-3
                px-2.5
                sm:px-3
                flex
                flex-nowrap 
                whitespace-nowrap
                rounded-t-lg
                text-sm
                md:text-md
                font-medium
                
              border-gray-200
              relative
              ${
                tab.id === "chat" &&
                count?.messages?.unread &&
                count.messages.unread > 0
                  ? "pr-8 gap-3"
                  : ""
              }
              ${
                tab.label === "Offer History"
                  ? "hidden md:inline-block"
                  : "inline-block"
              }
        ${
          activeTab === tab.id
            ? " border-b-2 border-orange-400 text-orange-600"
            : "bg-white"
        }
        }`}
            >
              {tab.label}
              {activeTab !== tab.id &&
                tab.id === "chat" &&
                count?.messages?.unread &&
                count.messages.unread > 0 ? (
                  <div className="">
                    <div className="rounded-full border border-b-2 border-orange-400 bg-orange-400 w-3 h-3 right-0  -mt-0.5 mr-0.5 absolute mx-2"></div>

                  </div>
                ) : null}
            </div>
          </div>
        );
      })}
      <div className="relative">
        {tabs.some((tab) => !tab.primary) && (
          <div className="flex w-full">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className={`
                cursor-pointer 
                border-r
                border-t
                
                px-3 md:px-4 py-3
                flex-nowrap 
                whitespace-nowrap
                rounded-t-lg
                flex md:hidden
                items-center
                bg-gray-50
                flex-1
                w-full
              `}
            >
              <FaChevronRight className="text-[18px]" />
            </div>
            {isOpen && (
              <div
                className={` rouned-xl shadow-md bg-white overflow-hidden right-0 w-auto top-10 text-sm absolute rounded-b-xl border border-gray-200 flex-nowrap`}
                ref={dropdownRef}
                style={{ zIndex: 9999 }}
              >
                <div className="flex flex-col cursor-pointer z-30">
                  <>
                    {tabs &&
                      tabs.map((tab: any, i: number) => {
                        if (tab.primary) return null;
                        return (
                          <MenuItem
                            key={i}
                            label={tab.label}
                            onClick={() => changeTab(tab.id)}
                          />
                        );
                      })}
                  </>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {additionalData && (
        <div className="ml-auto hidden md:block">{additionalData}</div>
      )}
    </ul>
  );
};

export default Tabs;
