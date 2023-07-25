import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing, User } from ".prisma/client";
import { createActivityForUser } from "@/prisma";

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  listing: Listing;
  transactionResult: User[];
}

export default async function submitBid(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const now = Date.now();

  if (req.method === "POST") {

    const { price, id, bidById, userId } = req.body;

    console.log("REQUEST",req.body);
    

    try {
      const updateListing = await prisma.listing.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          activities: true,
          userId: true,
          bids: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          }
        },
      });

      if (!updateListing) { return res.status(400).json({ error: "Unable to find listing" }); }

      

    const newBid = await prisma.bid.create({
      data: {
        price: price,
        listingId: updateListing.id,
        userId: userId,
        previous: updateListing.bids[updateListing.bids.length - 1]?.price || "0",
      },
    });
      const listing = await prisma.listing.update({
        where: {
          id: updateListing.id,
        },
        data: {
          status: "negotiating",
          updatedAt: new Date(now),
          activities: [
            ...(Array.isArray(updateListing?.activities)
              ? updateListing.activities
              : []),
            {
              message: "New bid submitted",
              userId: bidById,
              type: "newBid",
              action: "/dashboard/offers/" + updateListing?.id,
              createdAt: now,
              status: "negotiating"
            },
          ],
        },
        include: {
          seller: true,
          buyer: true,
          user: true,
          bids: {
            orderBy: {
              createdAt: "desc",
            },
          },
        }
      });

      if (!listing) { return res.status(400).json({ error: "Unable to update listing" }); }
      
      const sellerActivity = {
        type: "Offer",
        message: `New bid submitted`,
        action: "/dashboard/offers/" + listing.id,
        modelId: listing.id,
        userId: bidById,
        createdAt: now,
        value: `By ${
          bidById === listing?.userId
            ? "You"
            : listing.bids[listing.bids.length - 1].userId ===
              listing.sellerId
            ? listing.seller.username
            : listing.buyer?.username
        }`,
      };

      const buyerActivity = {
        type: "Offer",
        message: `New bid submitted`,
        action: "/dashboard/offers/" + listing.id,
        modelId: listing?.id,
        userId: bidById,
        createdAt: now,
        value: `By ${
          bidById === listing?.userId
            ? "You"
            : listing.bids[listing.bids.length - 1].userId ===
              listing.sellerId
            ? listing.seller.username
            : listing.buyer?.username
        }`,
      };

      if (listing?.sellerId && listing.buyerId) {
        const seller = createActivityForUser(
          listing.sellerId,
          sellerActivity,
          listing.seller.activities
        );
        const buyer = createActivityForUser(
          listing.buyerId,
          buyerActivity,
          listing?.buyer?.activities
        );
        const transactionOperations = [seller, buyer];

        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } 
    } catch (error) {
      console.log("Error occurred:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
    
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
