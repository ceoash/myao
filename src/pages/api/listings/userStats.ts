import { NextApiRequest, NextApiResponse } from "next";

export default async function userStats(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userId, id } = req.query;

    if (!userId || !id) {
      return res.status(400).json({ error: "Missing necessary parameters." });
    }

    try {
      const countOffers = await prisma?.bid.count({
        where: {
          userId: String(userId),
          listingId: String(id),
        },
      });

      const lastOffer = await prisma?.bid.findFirst({
        where: {
          listingId: String(id),
          userId: String(userId),
        },
        orderBy: {
          price: "desc",
        },
        select: {
            price: true,
        },
      });

      const higestOffer = await prisma?.bid.findFirst({
        where: {
          listingId: String(id),
          userId: String(userId),
        },
        orderBy: {
          price: "desc",
        },
        select: {
          price: true,
        },
      });

      const lowestOffer = await prisma?.bid.findFirst({
        where: {
          listingId: String(id),
          userId: String(userId),
        },
        orderBy: {
          price: "asc",
        },
        select: {
          price: true,
        },
      });

      const userStats = {
        lastOffer: lastOffer?.price || 0,
        count: countOffers || 0,
        higestOffer: higestOffer?.price || 0,
        lowestOffer: lowestOffer?.price || 0,
      };

      res.status(200).json(userStats);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
