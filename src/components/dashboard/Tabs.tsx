import StatusChecker from "@/utils/status";
import { BiChevronRight } from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa";

interface TabsProps {
  setTab: (tab: string) => void;
  tabs: {id: string, label: string}[];
  lg?: boolean;
  uppercase?: boolean;
  status?: string;
  tab: string;
  isListing?: boolean;
  main?: boolean;
  additionalData?: any;
}

const Tabs = ({ setTab, tabs, status, lg, uppercase, tab: activeTab, isListing, main, additionalData }: TabsProps) => {
  
  return (

<ul className="flex border-l rounded-tl-lg flex-wrap text-md font-medium text-center text-gray-700 border-b border-gray-200 ">

    {main && (
      <li
        key={'overview'}
        onClick={() => setTab("overview")}
        className={`
        cursor-pointer 
        border-r
        border-t
        bg-gray-100 rounded-t-lg active
        px-4 py-2
        inline-block
        whitespace-nowrap
        md:hidden
        ${ activeTab === "overview" ? " bg-gray-50  border-gray-200" : 'border-gray-200'}
        }`}
      >
        <span>Overview</span>
       
      </li>

      )}
      {tabs.map((tab, i) => {
        if (status !== 'awaiting approval' && status !== "negotiating" && tab.id === 'chat') return null;
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
        px-4 py-2
        flex
        flex-nowrap 
        whitespace-nowrap
        rounded-t-lg
        bg-white
        ${tab.label === "Activity" || tab.label === "Bid History"  ? "hidden md:inline-block" : "inline-block"}

        
        ${ activeTab === tab.id ? " bg-gray-50 border-gray-200" : "border-gray-200"}
        }`}
      >
        {tab.label}
      </div>)
     

    })}
     <div
        className={`
        cursor-pointer 
        border-r
        border-t
        first:border-l rounded-tl-lg
        last:border-l rounded-tr-lg
        px-4 py-2
        flex-nowrap 
        whitespace-nowrap
        rounded-t-lg
        flex md:hidden
        items-center
        `}
      >
        <FaChevronRight className="text-[14px]" />
      </div>

    
     {additionalData && (
        <div className="ml-auto hidden md:block">
          {additionalData}
        </div>
      )}
</ul>

  );
};

export default Tabs;
