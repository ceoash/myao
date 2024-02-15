import Badge from "./Badge";
import OfferTypeBadge from "./OfferTypeBadge";
import StatusChecker from "@/utils/status";

interface OfferNavProps {
  setTab: (tab: string) => void;
  tab: string;
  status: string;
  listingType: string;
}

const OfferNav = ({ setTab, tab, status, listingType }: OfferNavProps) => {
  return (
    <div className="col-span-12 pb-4 flex font-bold font-md  md:font-xl gap-4 uppercase border-b border-gray-200 mb-4">
      <div
        onClick={() => setTab("details")}
        className={`cursor-pointer ${
          tab === "details" && "border-b-4 border-orange-default "
        }`}
      >
        Details
      </div>
      {status === "awaiting approval" ||
        (status === "negotiating" && (
          <div
            onClick={() => setTab("chat")}
            className={`cursor-pointer ${
              tab === "chat" && "border-b-4 border-orange-default "
            }`}
          >
            Chat
          </div>
        ))}
      <div
        onClick={() => setTab("activity")}
        className={`cursor-pointer ${
          tab === "activity" && "border-b-4 border-orange-default "
        }`}
      >
        Activity
      </div>
      <div
        onClick={() => setTab("bids")}
        className={`cursor-pointer ${
          tab === "bids" && "border-b-4 border-orange-default "
        }`}
      >
        Offer History
      </div>
      <div className="ml-auto hidden md:flex ">
        <Badge>{StatusChecker(status || "")}</Badge>
        <OfferTypeBadge type={listingType} />
      </div>
    </div>
  );
};

export default OfferNav;
