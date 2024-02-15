import AlertBanner from '../AlertBanner'
import { Session } from 'next-auth';
import { ProfileUser } from '@/interfaces/authenticated';

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
    handleFinalise
}: OfferAlertsProps) => {
  return (
    <>
    {status === "accepted" && (
      <AlertBanner
        text={ completedBy === session?.user.id ? 
          completedBy === listing.buyerId ? "You accepted the latest offer. Make payment to complete the negotiation" : `You accepted the latest offer. Payment instructions have been sent to ${participant?.username }`: 
          session?.user.id === listing.buyerId && completedBy !== session?.user.id ? "Your offer has been accepted. Make payment to complete the negotiation" : `Your offer was accepted the. Payment instructions have been sent to ${participant?.username}` }
        success
        button
        buttonText={session?.user.id === listing.buyerId ? "Pay" : "Contact "}
        onClick={() => (
          session?.user.id === listing.buyerId ? handleStatusChange("completed", session?.user.id) : {}

          )
        }
      />
    )}
    {status === "completed" && (
      <AlertBanner
        text={completedBy === session?.user.id ? "We've received your payment. Leave a review for " + participant?.username : "Your offer has been paid. Leave a review for " + participant?.username}
        success
        button
        buttonText={"Leave a review"}
      />
    )}
    {status === "rejected" && (
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
    )}
          {status === "cancelled" && (
            <AlertBanner
              text={
                completedBy === session?.user.id
                  ? "You terminated the trade."
                  : "This trade has been terminated"
              }
              danger
              button
              buttonText={`Contact ${
                listing.sellerId === session?.user.id ? "Buyer" : "Seller"
              }`}
              onClick={() => participant?.id && session?.user?.id && handleFinalise(session?.user?.id, participant?.id || "")}
            />
          )}
    </>
  )
}

export default OfferAlerts