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
}: TabsProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
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
    <ul key={tabs[0].label + tabs[tabs.length - 1].id} className="flex border-l rounded-tl-lg flex-wrap text-md font-medium text-center text-gray-700 border-b border-gray-200 relative">
      {main && (
        <li
          key={"overview"}
          onClick={() => setTab("overview")}
          className={`
            cursor-pointer 
            border-r
            border-t
            rounded-t-lg active
            px-2.5
            sm:px-3
            text-sm
            md:px-4 py-2
            inline-block
            whitespace-nowrap
            md:hidden
            border-gray-20
            font-medium
            md:font-bold
            ${
              activeTab === "overview"
                ? " bg-orange-400 text-white"
                : "bg-white"
            }
          }`}
        >
          <span>Overview</span>
        </li>
      )}
      {tabs.map((tab, i) => {
        if (
          status !== "awaiting approval" &&
          status !== "negotiating" &&
          tab.id === "chat"
        )
          return null;
        return (
          <div key={i} className="relative ">
            {tab.notificationsCount && tab.notificationsCount > 0 ? (
              <div className="absolute -top-1 -right-1 bg-orange-default text-white px-1.5 text-xs font-bold rounded-full z-20">
              {tab.notificationsCount}
            </div>
            ) : ""}

            <div
              
              onClick={() => setTab(tab.id)}
              className={`
            cursor-pointer 
            border-r
            border-t
            first:border-l rounded-tl-lg
            last:border-l rounded-tr-lg
            md:px-4 py-2
            px-2.5
            sm:px-3
            flex
            flex-nowrap 
            whitespace-nowrap
            rounded-t-lg
            text-sm
            md:text-md
            font-medium
            md:font-bold
          border-gray-200
          
        ${
          tab.label === "Bid History"
            ? "hidden md:inline-block"
            : "inline-block"
        }

        
        ${activeTab === tab.id ? " bg-orange-400 text-white" : "bg-white"}
        }`}
            >
              {tab.label}
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
                first:border-l rounded-tl-lg
                last:border-l rounded-tr-lg
                px-3 md:px-4 py-2
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
                            onClick={() => setTab(tab.id)}
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
