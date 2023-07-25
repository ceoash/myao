import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  if (!id ) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  
  try {
    const bids = await prisma?.bid.findMany({
        where: {
          listingId: id,
        },
        select: {
          id: true,
          previous: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
        },
      });
    if (bids.length === 0) {
        return res.status(200).json({ error: "nothing was found" });
      } else {
        return res.status(200).json({ bids });
      }
      
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
