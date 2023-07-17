import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { category, userId, skip, PAGE_SIZE } = req.body;

  try {
    const received = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: userId as string },
              { type: "sellerOffer" },
              { status: category as string },
            ],
          },
          {
            AND: [
              { sellerId: userId as string },
              { type: "buyerOffer" },
              { status: category as string },
            ],
          },
        ],
      },
      skip: skip || 0,
      take: PAGE_SIZE || 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        expireAt: true,
        status: true,
        type: true,
        image: true,
        category: true,
        bid: true,
        price: true,
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { image: true } },
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { image: true } },
          },
        },
      },
    });
    if (received.length === 0) {
        return res.status(200).json({ error: "nothing was found" });
      } else {
        return res.status(200).json({ received });
      }
      
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
