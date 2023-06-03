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
  if (req.method === "POST") {
    const { message, recipientId, senderId, listingId } = req.body;

    
    try {
      const newMessage = await prisma.listing.update({
        where: {
            id: listingId,
          },
          data: {
            messages: {
              create: [
                {
                  senderId: senderId,
                  recipientId: recipientId,
                  text: message,
                },
              ],
            },
          },
          include: {
            sender: true, // Include sender details
            recipient: true, // Include recipient details
            messages: true, // Include messages
          },
      });
      await prisma.notification.create({
        data: {
          message: "New Offer message",
          read: false,
          url: `/dashboard/offers/${listingId}`, 
          userId: recipientId, 
          senderId: senderId, 
        }
      })
      res.status(200).json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
