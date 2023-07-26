import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.body;

  if (!userId ) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  
  try {
    const sent = await prisma?.listing.count({
        where: {
          OR: [
            { sellerId: userId as string, type: "sellerOffer" },
            { buyerId: userId as string, type: "buyerOffer" },
          ],
        },
      });
    const received = await prisma?.listing.count({
        where: {
          OR: [
            { buyerId: userId as string, type: "sellerOffer" },
            { sellerId: userId as string, type: "buyerOffer" },
          ],
        },
      });
    const completed = await prisma?.listing.count({
        where: {
          OR: [
            { buyerId: userId as string, type: "sellerOffer", status: "completed" },
            { sellerId: userId as string, type: "buyerOffer", status: "completed" },
          ],
        },
      });
    const cancelled = await prisma?.listing.count({
        where: {
          OR: [
            { buyerId: userId as string, type: "sellerOffer", status: "cancelled" },
            { sellerId: userId as string, type: "buyerOffer", status: "cancelled" },
          ],
        },
      });

    return res.status(200).json({ sent });
      
      
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
