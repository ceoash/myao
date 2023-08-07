import StatusChecker from "@/utils/status";

interface TabsProps {
  setTab: (tab: string) => void;
  tabs: {id: string, label: string}[];
  lg?: boolean;
  uppercase?: boolean;
  status?: string;
  tab: string;
  isListing?: boolean;
  main?: boolean;
}

const Tabs = ({ setTab, tabs, status, lg, uppercase, tab: activeTab, isListing, main }: TabsProps) => {
  return (
    <div className={`col-span-12 pb-4 flex font-bold font-md md:font-xl gap-4 border-b border-gray-200 mb-4 ${main && 'uppercase'}`}>
      
      {tabs.map((tab, i) => {
        if (status !== 'awaiting approval' && status !== "negotiating" && tab.id === 'chat') return null;
        return (
        <div
        key={i}
        onClick={() => setTab(tab.id)}
        className={`
        cursor-pointer 
        ${ activeTab === tab.id && "border-b-4 border-orange-400 "
        }`}
      >
        {tab.label}
      </div>)

    })}
    <div className="ml-auto">
    { isListing && main && StatusChecker(status || "")}
    </div>
    </div>
  );
};

export default Tabs;
