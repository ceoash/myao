import { NextApiRequest, NextApiResponse } from "next";

import { ExtendedActivity } from "@/interfaces/authenticated";
import { createActivity } from "@/prisma";
import { Listing } from ".prisma/client";

import prisma from "@/libs/prismadb";

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  listing: Listing;
  transactionResult: ExtendedActivity[];
}

export default async function submitBid(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const now = Date.now();

  if (req.method === "POST") {
    const { price, id, bidById, userId } = req.body;


    try {
      const updateListing = await prisma.listing.findFirst({
        where: {
          id,
        },
        select: {
          status: true,
          seller: {
            select: {
              id: true,
              username: true,
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
            },
          },

          bids: {
            take: 1,
            select: {
              price: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!updateListing) {
        return res.status(400).json({ error: "Unable to find listing" });
      }

      const listing = await prisma.listing.update({
        where: {
          id: id,
        },
        data: {
          updatedAt: new Date(now),
          status: updateListing.status === "rejected" ? "negotiating" : updateListing.status || "",
          bids: {
            create: [
              {
                price: parseFloat(price.toString()),
                userId: userId,
                previous:
                  updateListing.bids[updateListing.bids.length - 1]?.price ||
                  0,
              },
            ],
          },
        },
        include: {
          bids: true,
          seller: true,
          buyer: true,
        },
      });


      if (!listing) {
        return res.status(400).json({ error: "Unable to update listing" });
      }

      const buyerActivity = createActivity({
        type: "listing",
        message: `New offer submitted by ${
          listing.userId === listing?.buyerId ? "You" : listing?.seller?.username
        }`,
        listing_message: listing.title || "",
        listing_message_type: "bid",
        userId: listing.buyerId || "",
        user_message: "listing updated",
        user_message_type: "listing",
        action: `/dashboard/offers/${listing.id}`,
        receiverId: listing.sellerId || "",
      });

      const sellerActivity = createActivity({
        type: "listing",
        message: `New offer submitted by ${
          listing.userId === listing.sellerId ? "You" : listing.buyer?.username
        }`,
        listing_message: listing.title || "",
        listing_message_type: "bid",
        userId: listing.sellerId || "",
        user_message: "listing updated",
        user_message_type: "listing",
        action: `/dashboard/offers/${listing.id}`,
        receiverId: listing.buyerId || "",
      });

      if (listing?.sellerId && listing.buyerId) {
        const transactionOperations = [sellerActivity, buyerActivity];

        try {
          const transactionResult = await prisma.$transaction(
            transactionOperations
          );
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res
            .status(500)
            .json({ error: "Something went wrong during the transaction" });
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
