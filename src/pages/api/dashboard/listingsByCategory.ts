import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { category, userId, skip, PAGE_SIZE, blockedIds } = req.body;

  if (!category || !userId) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: userId, status: category },
              {
                sellerId: {
                  notIn: blockedIds || [],
                },
              },
            ],
          },
          {
            AND: [
              { sellerId: userId, status: category },
              {
                buyerId: {
                  notIn: blockedIds || [],
                },
              },
            ],
          },
        ],
      },
      skip: skip,
      take: PAGE_SIZE,
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

        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        price: true,
        sellerId: true,
        buyerId: true,
        userId: true,
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
    if (listings.length === 0) {
      return res.status(200).json({ error: "nothing was found" });
    } else {
      return res.status(200).json({ listings });
    }
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
