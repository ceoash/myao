import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";
import { Activity } from "@/interfaces/authenticated";
import StatusChecker from "@/utils/status";

interface ErrorResponse {
  error: string;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
  if (req.method === "POST") {
    const { message, sellerId, buyerId, listingId, image, userId } = req.body;

    const now = Date.now();
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { activities: true, buyer: true, seller: true, status: true },
      });

      if (!listing) {
        res.status(404).json({ error: "listing not found" });
        return;
      }

      const status = StatusChecker(listing.status || "");

      const newBuyerActivity = {
        type: "ListingMessage",
        message: "New listing message",
        action: "/dashboard/offers/" + listingId,
        modelId: listingId,
        createdAt: now,
        value: listing.status,
        userId: userId,
      };
      const newSellerActivity = {
        type: "Listing Message",
        message: "New listing message",
        action: "/dashboard/offers/" + listingId,
        modelId: listingId,
        createdAt: now,
        value: listing.status,
        userId: userId,
      };
      const newActivity = {
        type: "ListingMessage",
        message: "New listing message",
        action: "/dashboard/offers/" + listingId,
        modelId: listingId,
        createdAt: now,
        value: listing.status,
        userId: userId,
      };

      let activities = [listing.activities];
      activities?.push(newActivity);

      const updatedMessage = await prisma.listing.update({
        where: {
          id: listingId,
        },
        data: {
          activities: activities,
          messages: {
            create: [
              {
                buyerId: buyerId,
                sellerId: sellerId,
                text: message,
                userId: userId,
                image: image,
              },
            ],
          },
        },
        include: {
          buyer: true,
          seller: true,
          messages: {
            include: {
              buyer: true,
              seller: true,
              user: true,
            },
          },
        },
      });

      if (listing.buyer) {
        const buyer = await prisma.user.findUnique({
          where: { id: listing.buyer.id },
          select: { activities: true },
        });

        if (!buyer) {
          res.status(404).json({ error: "buyer not found" });
          return;
        }

        const buyerActivities = [
          ...(Array.isArray(buyer.activities) ? buyer.activities : []),
          newBuyerActivity,
        ];

        await prisma.user.update({
          where: { id: buyerId },
          data: { activities: buyerActivities },
        });
      }
      if (listing.seller) {
        const seller = await prisma.user.findUnique({
          where: { id: listing.seller.id },
          select: { activities: true },
        });

        if (!seller) {
          res.status(404).json({ error: "Seller not found" });
          return;
        }

        const sellerActivities = [
          ...(Array.isArray(seller.activities) ? seller.activities : []),
          newSellerActivity,
        ];

        await prisma.user.update({
          where: { id: sellerId },
          data: { activities: sellerActivities },
        });
      }

      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
