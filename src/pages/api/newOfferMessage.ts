import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { Listing } from ".prisma/client";
import { tr } from "date-fns/locale";

interface ErrorResponse {
  error: string;
}

export default async function newOfferMessage(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
  if (req.method === "POST") {
    const { message, sellerId, buyerId, listingId, image, userId } = req.body;

    const now = Date.now();
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          activity: {
            include: {
              listingActivity: true,
              userActivity: true,
            },
          },
         
          status: true,
          id: true,
          title: true,
          buyerId: true,
          sellerId: true,
        },
      });

      if (!listing) {
        res.status(404).json({ error: "listing not found" });
        return;
      }

      const updatedMessage = await prisma.listing.update({
        where: {
          id: listingId,
        },
        data: {
          updatedAt: new Date(now),
          messages: {
            create: [
              {
                buyerId: buyerId,
                sellerId: sellerId,
                text: message,
                userId: userId,
                image: image,
                read: false,
              },
            ],
          },
        },
        include: {
          buyer: true,
          seller: true,
          messages: {
            include: {
              buyer:{
               include: {profile: true}
    
              },
              seller:{
               include: {profile: true}
    
              },
              user:{
               include: {profile: true}
    
              },
            },
          },
        },
      });

      const sender = updatedMessage.buyerId === userId ? updatedMessage.buyer : updatedMessage.seller
      const receiver = updatedMessage.buyerId === userId ? updatedMessage.seller : updatedMessage.buyer
      
      if(!sender && !receiver) return res.status(404).json({ error: "sender or receiver not found" });
      
      const notification  = await prisma.notification.create({
        data: {
          userId: sender?.id || "",
          message: `Message received from ${sender?.username ? sender.username : "unknown"}`,
          action: `/dashboard/conversations?conversationId=${listingId}`,
          type: "conversation",
          read: false,
        }
      })

      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
