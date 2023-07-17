import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing, User } from ".prisma/client";
import { createActivityForUser } from "@/prisma";

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  listing: Listing,
  transactionResult: User[],
}

export default async function submitBid(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {

  const now = Date.now()

  if (req.method === "POST") {
    const { price, id, bidById } = req.body;

    try {
      const updateListing = await prisma.listing.findFirst({
        where: {
          id,
        },
        select: {
          sellerId: true,
          seller: true,
          buyerId: true,
          bid: true,
          buyer: true,
          bidder: true,
          bidderId: true,
          id: true,
          activities: true,
          userId: true,
          user: true,
        },
      });

      if(!updateListing) return res.status(404).json({ error: "Offer not found"})

      const listing = await prisma.listing.update({
        where: {
          id,
        },
        data: {
          bid: price,
          bidderId: bidById,
          activities: [ ...(Array.isArray(updateListing?.activities) ? updateListing.activities : []), 
            { message: "New bid submitted", userId: bidById, type: "newBid", action: "/dashboard/offers/" + updateListing?.id, createdAt: now}]
        },
        include: {
          bidder: {
            include: {
              profile: true,
            },
          },
        },
      });

      try {
      await prisma.bid.create({
        data: {
          price: price, 
          listingId: listing.id, 
          userId: bidById, 
          previous: updateListing.bid ? updateListing.bid : '0'
        }
      });
      } catch (error) {
        res.status(404).json({error: "cant save message"})
      }

     

      const sellerActivity = {
        type: "Offer",
        message: `New bid submitted`,
        action: "/dashboard/offers/" + updateListing.id,
        modelId: updateListing.id,
        userId: bidById,
        createdAt: now,
        value: `By ${bidById === updateListing?.userId ? "You" : updateListing.bidder?.username}`
      };
      const buyerActivity = {
        type: "Offer",
        message: `New bid submitted`,
        action: "/dashboard/offers/" + updateListing.id,
        modelId: listing?.id,
        userId: bidById,
        createdAt: now,
        value: `By ${bidById === updateListing?.userId ? "You" : updateListing.bidder?.username}`
      };

      if (updateListing?.sellerId && updateListing.buyerId) {
        const seller = createActivityForUser(updateListing.sellerId, sellerActivity, updateListing.seller.activities);
        const buyer = createActivityForUser(updateListing.buyerId, buyerActivity, updateListing?.buyer?.activities);
        const transactionOperations = [seller, buyer];
        console.log("buyer and seller")

        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } else if (updateListing.userId) {
        const user = createActivityForUser(updateListing.userId, sellerActivity, updateListing.user.activities);
        const transactionOperations = [user];
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } else {
        console.log("no buyer or seller")
      }

    } catch (error) {
      res.status(404).json({ error: "Something went wrong"})
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
