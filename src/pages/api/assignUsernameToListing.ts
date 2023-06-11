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
            buyerId: userId,
            status: "awaiting approval"
        },
        include: {
          buyer: true,      // Include buyer details
          seller: true,    // Include seller details
          messages: true     // Include messages
      }
    });
    
   
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
