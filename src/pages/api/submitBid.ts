import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function submitBid(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
  if (req.method === "POST") {
    const { price, id } = req.body;

    try {
      const listing = await prisma.listing.update({
        where: {
          id,
        },
        data: {
          bid: price,
        },
      });

      await prisma.notification.create({
        data: {
          message: `New bid of ${price} has been placed`,
          read: false,
          url: `/listings/${listing.id}`, 
          userId: listing.buyerId ? listing.buyerId : listing.buyerId, 
          buyerId: listing.buyerId, 
        }
      })

      if (listing) {
        res.status(200).json(listing);
      } else {
        res.status(404).json({ error: "Bid not updated" });
      }
    } catch (error) {
      console.error("Error editing listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
