import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";
import { createActivityForUser } from "@/prisma";
import { Activity } from "@/interfaces/authenticated";

interface ErrorResponse {
  error: string;
}

interface ListingResponse {
  listing: Listing
  transactionResult: Activity[]
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<ListingResponse | ErrorResponse>
) {
    const { listingId, status, userId } = req.body;

    
    const now = Date.now()
    try {
      const findListing = await prisma.listing.findUnique({
        where: { id: listingId},
        include: { seller: true, buyer: true}
      })
      if(!findListing){
        return res.status(404).json({error: "listing not found"})
      }

      const completedBy = findListing.sellerId === userId ? findListing.seller : findListing.buyer
      let message;
      switch (status) {
        case "negotiation":
          message = `Negotiation started`;
          break;
        case "completed":
          message = `Completed by ${completedBy?.username}`;
          break;
        case "cancelled":
          message = `Cancelled by ${completedBy?.username}`;
          break;
        case "rejected":
          message = `Rejected by ${completedBy?.username}`;
          break;
        default:
          message = `Status updated by ${completedBy?.username}`
          break;
      }

      const listing: any = await prisma.listing.update({
        where: { id: findListing?.id },
        data: { 
            status,
            completedById: userId,
            activities: [ ...(Array.isArray(findListing?.activities) ? findListing.activities : []), 
            { message: message, userId: userId, type: "Offer Updated", action: "/dashboard/offers/" + findListing?.id, createdAt: now}]
         },
         include: {
          buyer: true,
          seller: true,
          user: true,
         }
      });

      if(!listing) return res.status(404).json({error: "Listing not found"});

      const buyerActivity = {
        type: "Offer",
        message: userId === listing?.buyer?.id ? `You ${status !== "negotiating" ? status : "are negotiating"} your offer` : `${status === "negotiating" && 'You and '}` + listing?.seller?.username + `${status !== "negotiating" ? status + " the offer" : " are negotiating"}`,
        action: "/dashboard/offers/" + listing.id,
        modelId: listing.id,
        createdAt: now,
        value: listing.status,
        userId: userId
      };
      const sellerActivity = {
        type: "Offer",
        message: userId === listing?.seller?.id ? `You ${status !== "negotiating" ? status : "are negotiating"} your offer` : `${status === "negotiating" ? 'You and ' + listing?.buyer?.username + ' ':  listing?.buyer?.username} `  + `${status !== "negotiating" ? status + " the offer" : " are negotiating"}`,
        action: "/dashboard/offers/" + listing.id,
        modelId: listing?.id,
        createdAt: now,
        value: listing.status,
        userId: userId
      };

      if (listing?.sellerId && listing.buyerId) {
        const seller = createActivityForUser(listing.sellerId, sellerActivity, listing.seller.activities);
        const buyer = createActivityForUser(listing.buyerId, buyerActivity, listing.buyer?.activities);
        const transactionOperations = [seller, buyer];
        
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } else if (listing.userId) {
        const user = createActivityForUser(listing.userId, sellerActivity, listing.user.activities);
        const transactionOperations = [user];
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
   
      } else {
        res.status(404).json({ error: "Buyer or seller not found" });
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
