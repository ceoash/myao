import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { listingId, userId } = req.body;

  try {
    
    const listing = await prisma?.listing.update({
        where: {
            id: listingId
        },
        data: {
            recipientId: userId,
            status: "negotiating"
        },
        include: {
          sender: true,      // Include sender details
          recipient: true,    // Include recipient details
          messages: true     // Include messages
      }
    });
    
    await prisma.notification.create({
      data: {
        message: `New offer from ${listing?.sender?.name ? listing?.sender?.name : listing?.sender?.email}}`,
        read: false,
        url: `/listings/${listingId}`, 
        userId: userId, 
        senderId: listing?.senderId, 
      }
    })

    if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
    }

    res.status(200).json({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "error" });
  }
}
