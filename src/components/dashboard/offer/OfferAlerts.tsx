import React from 'react'
import AlertBanner from '../AlertBanner'
import { Listing, User } from '@prisma/client';
import { Session } from 'next-auth';
import { ProfileUser } from '@/interfaces/authenticated';

interface OfferAlertsProps {
    status: string;
    completedBy: string | null | undefined;
    participant: ProfileUser | null | undefined;
    listing: Listing;
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
              text="This offer has been accepted"
              success
              button
              buttonText={"Mark as complete"}
              onClick={() => handleStatusChange("completed", session?.user.id)}
            />
          )}
          {status === "completed" && (
            <AlertBanner
              text="Congratulations! You've completed your offer"
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
                  ? "You rejected the latest bid. Awaiting repsonse from " +
                    participant?.username
                  : "Your bid has been rejected. Submit a new bid to continue "
              }
              danger
              button
            />
          )}
          {status === "cancelled" && (
            <AlertBanner
              text={
                completedBy === session?.user.id
                  ? "You terminated the offer."
                  : "This offer has been terminated"
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