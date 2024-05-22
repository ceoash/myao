import AlertBanner from "../AlertBanner";
import { Session } from "next-auth";
import { ProfileUser } from "@/interfaces/authenticated";

interface OfferAlertsProps {
  status: string;
  completedBy: string | null | undefined;
  participant: ProfileUser | null | undefined;
  listing: any;
  session: Session;
  handleStatusChange: (status: string, sessionId: string) => void;
  handleFinalise: (status: string, userId: string) => void;
}

const OfferAlerts = ({
  status,
  completedBy,
  participant,
  listing,
  session,
  handleStatusChange,
  handleFinalise,
}: OfferAlertsProps) => {
  return (
    <>
      {status === "accepted" && (
        <div className="mt-6 lg:mt-10 mx-8 -mb-2">
          <AlertBanner
            text={
              completedBy === session?.user.id
                ? completedBy === listing.buyerId
                  ? "You accepted the latest offer. Make payment to complete the negotiation"
                  : `You accepted the latest offer. Payment instructions have been sent to ${participant?.username}`
                : session?.user.id === listing.buyerId &&
                  completedBy !== session?.user.id
                ? "Your offer has been accepted. Make payment to complete the negotiation"
                : `Your offer was accepted the. Payment instructions have been sent to ${participant?.username}`
            }
            success
            button
            buttonText={
              session?.user.id === listing.buyerId ? "Pay" : "Contact "
            }
            onClick={() =>
              session?.user.id === listing.buyerId
                ? handleStatusChange("completed", session?.user.id)
                : {}
            }
          />
        </div>
      )}
      {status === "completed" && (
        <div className="mt-6 lg:mt-10 mx-8 -mb-2">
          <AlertBanner
            text={
              completedBy === session?.user.id
                ? "You accepted this offer. Contact counterparty to finalise the transfer of items  " 
                : "Congratulations your offer was accepted. Contact counterparty to finalise the transfer of items" 
                  
            }
            success
            button
            buttonText={"Leave a review"}
          />
        </div>
      )}
      {status === "rejected" && (
        <div className="mt-6 lg:mt-10 mx-8 -mb-2">
          <AlertBanner
            text={
              completedBy &&
              session?.user.id &&
              completedBy === session?.user.id
                ? "You rejected the latest offer. Awaiting repsonse from " +
                  participant?.username
                : "Your offer has been rejected. Submit a new offer to continue "
            }
            danger
            button
          />
        </div>
      )}
      {status === "cancelled" && (
        <div className="mt-6 lg:mt-10 mx-8 -mb-2">
          <AlertBanner
            text={
              completedBy === session?.user.id
                ? "You terminated the trade."
                : "This trade has been terminated"
            }
            danger
            button
            buttonText={`Contact ${
              listing?.sellerId === session?.user.id ? "Buyer" : "Seller" || ""
            }`}
            onClick={() =>
              participant?.id &&
              session?.user?.id &&
              handleFinalise(session?.user?.id, participant?.id || "")
            }
          />
        </div>
      )}
    </>
  );
};

export default OfferAlerts;
