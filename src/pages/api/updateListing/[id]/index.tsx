import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing, DirectMessage, User } from ".prisma/client";
import { createActivityForUser } from "@/prisma";

interface ErrorResponse {
  error: string;
}
interface IListing extends Listing { 
  activities: any;
}
interface ListingResponse {
  listing: IListing;
  message?: DirectMessage;
  transactionResult?: User[];
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<ListingResponse | ErrorResponse>
) {
  
    const id = req.query.id as string;
    const { title, description, price, image, buyerId, category, userId, sellerId } = req.body;

    const now = Date.now();

    try {
      const updateListing = await prisma.listing.findUnique({
        where: { id },
        select: { activities: true, id: true, user: { select: { username: true}} },
      });

      if(!updateListing) return res.status(404).json({ error: "Listing not found" });

      const now = Date.now();
      const newActivity = {
        type: "New Offer",
        message: "Offer updated by " + updateListing?.user?.username,
        action: "/dashboard/offers/" + updateListing.id,
        modelId: updateListing?.id,
        createdAt: now,
        userId: userId
      };
  
      if (!updateListing) {
        res.status(404).json({ error: "Offer not found" });
        return;
      }

      const ListingActivities = [
        ...(Array.isArray(updateListing.activities) ? updateListing.activities : []),
        newActivity,
      ];

      const listing = await prisma.listing.update({
        where: { id: id },
        include: { seller: true, buyer: true, user: true },
        data: { activities: ListingActivities, title, description, price, image, buyerId, sellerId, category },
      });

      const buyerActivity = {
        type: "UpdatedOffer",
        message: "Listing updated",
        action: "/dashboard/offers/" + id,
        modelId: id,
        createdAt: now

      };
      const sellerActivity = {
        type: "UpdatedOffer",
        message: "Listing updated",
        action: "/dashboard/offers/" + id,
        modelId: id,
        createdAt: now
      };

      if (listing?.seller && listing.buyer) {
        const seller = createActivityForUser(listing.seller.id, sellerActivity, listing.seller.activities);
        const buyer = createActivityForUser(listing.buyer.id, buyerActivity, listing?.buyer?.activities);
        const transactionOperations = [seller, buyer];

        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
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
