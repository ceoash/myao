import StatusChecker from "@/utils/status";
import { useRef, useState } from "react";
import { BiChevronRight } from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa";
import MenuItem from "../MenuItem";
import { signOut } from "next-auth/react";

interface TabsProps {
  setTab: (tab: string) => void;
  tabs: { id: string; label: string, primary?: boolean }[];
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

  return (
    <ul className="flex border-l rounded-tl-lg flex-wrap text-md font-medium text-center text-gray-700 border-b border-gray-200 relative">
      {main && (
        <li
          key={"overview"}
          onClick={() => setTab("overview")}
          className={`
        cursor-pointer 
        border-r
        border-t
        rounded-t-lg active
        px-3
        text-sm
        md:px-4 py-2
        inline-block
        whitespace-nowrap
        md:hidden
        border-gray-20
        font-bold
        ${activeTab === "overview" ? " bg-orange-400 text-white" : "bg-white"}
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
          <div
            key={i}
            onClick={() => setTab(tab.id)}
            className={`
            cursor-pointer 
            border-r
            border-t
            first:border-l rounded-tl-lg
            last:border-l rounded-tr-lg
            md:px-4 py-2
            px-3 
            flex
            flex-nowrap 
            whitespace-nowrap
            rounded-t-lg
            text-sm
            md:text-md
            font-bold
        border-gray-200
        ${
          tab.label === "Activity" || tab.label === "Bid History"
            ? "hidden md:inline-block"
            : "inline-block"
        }

        
        ${activeTab === tab.id ? " bg-orange-400 text-white" : "bg-white"}
        }`}
          >
            {tab.label}
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
                className={` rouned-xl shadow-md bg-white overflow-hidden left-0 w-auto top-10 text-sm absolute rounded-b-xl border border-gray-200 `}
                ref={ref}
                style={{ zIndex: 9999 }}
              >
                <div className="flex flex-col cursor-pointer z-30">
                  <>
                    {tabs &&
                      tabs.map((tab: any, i: number) => {
                        if(tab.primary) return null;
                        return <MenuItem
                          key={i}
                          label={tab.label}
                          onClick={() => setTab(tab.id)}
                        />
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
