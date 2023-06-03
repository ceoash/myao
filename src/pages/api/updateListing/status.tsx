import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
    const { listingId, status } = req.body;

    try {
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { status }
      });

      await prisma.notification.create({
        data: {
          message: `Offer ${listing.status}`,
          read: false,
          url: `/dashboard/offers/${listing.id}`, 
          userId: listing.recipientId ? listing.recipientId : listing.senderId, 
          senderId: listing.senderId, 
        }
      })

      res.status(200).json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
