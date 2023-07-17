import prisma from "@/libs/prismadb";
import { stat } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, page, tab, status, pageSize } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(pageSize);

    if (tab === "sent") {
      const listings = await prisma.listing.findMany({
        skip,
        take: Number(pageSize),
        where: {
          AND: [{ sellerId: id as string }, { status: status as string }],
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({ listings });
    }
    else if (tab === "received") {
      const listings = await prisma.listing.findMany({
        skip,
        take: Number(pageSize),
        where: {
          AND: [{ sellerId: id as string }, { status: status as string }],
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({ listings });
    }
    return res.status(404).json({ error: "nothing was found" });
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
