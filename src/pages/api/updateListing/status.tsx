import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";
import { createActivity } from "@/prisma";
import { ExtendedActivity } from "@/interfaces/authenticated";

interface ErrorResponse {
  error: string;
}

interface ListingResponse {
  listing: Listing
  transactionResult: ExtendedActivity[]
  userId?: string
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
        include: { seller: true, buyer: true, bids: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            price: true,
          }
        }}
      })
      if(!findListing){
        return res.status(404).json({error: "listing not found"})
      }

      const completedBy = findListing?.sellerId === userId ? findListing?.seller : findListing?.buyer
      let message;
      switch (status) {
        case "negotiation":
          message = `Negotiation started`;
          break;
        case "accepted":
          message = `Accepted by ${completedBy?.username}`;
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

      const id = Math.floor(Math.random() * Math.pow(10, 10));

      const prevMetadata = findListing.metadata || null;

      let metadata = {}

      if (prevMetadata) {
        metadata = prevMetadata;
      }

      if(status === "completed"){
        Object.assign(metadata, {
          completedBy: completedBy?.username,
          completedById: completedBy?.id,
          completedAt: new Date(now)
        })
      }

      if(status === "cancelled"){
        Object.assign(metadata, {
          cancelledBy: completedBy?.username,
          cancelledById: completedBy?.id,
          cancelledAt: new Date(now)
        })
      }

      if(status === "rejected"){
        Object.assign(metadata, {
          rejectedBy: completedBy?.username,
          rejectedById: completedBy?.id,
          rejectedAt: new Date(now)
        })
      }

      if(status === "accepted"){
        Object.assign(metadata, {
          acceptedBy: completedBy?.username,
          acceptedById: completedBy?.id,
          acceptedAt: new Date(now)
        })
      }

      const listing: any = await prisma.listing.update({
        where: { id: findListing?.id },
        data: { 
            status,
            completedById: userId,
            events: {
              push: { 
                id: String(id), 
                event: status, 
                price: findListing?.bids.length > 0 ? findListing?.bids[0].price : findListing.price,
                date: now, 
                userId: userId 
              }
            },
            updatedAt: new Date(now),
            metadata: {
              
            }
         },
         include: {
          buyer: true,
          seller: true,
          user: true,
         }
      });

      if(!listing) return res.status(404).json({error: "Listing not found"});
      

      const buyerActivity = createActivity({
        type: "listing",
        message: userId === listing?.buyer?.id 
        ? `You ${status !== "haggling" ? status : "are haggling"} your offer` 
        : `${status === "haggling" ? 'You and ' + listing?.seller?.username + " are haggling" : listing?.seller?.username + " " + status + " the offer"}`,
        listing_message: findListing.title || "",
        listing_message_type: "update",
        userId: findListing.buyerId || "",
        user_message: "listing updated",
        user_message_type: "listing",
        action: `/dashboard/trades/${findListing.id}`,
        receiverId: findListing?.sellerId || "",
      });

      const sellerActivity = createActivity({
        type: "listing",
        message: userId === listing?.seller?.id 
        ? `You ${status !== "haggling" ? status : "are haggling"} your offer` 
        : `${status === "haggling" ? 'You and ' + listing?.buyer?.username + " are haggling" : listing?.buyer?.username + " " + status + " the offer"}`,
        listing_message: findListing.title || "",
        listing_message_type: "update",
        userId: findListing?.sellerId || "",
        user_message: "listing updated",
        user_message_type: "listing",
        action: `/dashboard/trades/${findListing.id}`,
        receiverId: findListing.buyerId || "",
      });

      if (listing?.sellerId && listing.buyerId) {
        
        const transactionOperations = [sellerActivity, buyerActivity];
        
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult, userId });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } 
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
