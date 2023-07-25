import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

type QueryObject = {
  OR: {
    AND: {
      buyerId?: string,
      sellerId?: string,
      type?: string,
      status?: string,
    }[],
  }[],
}

function createQueryObject(userId: string, category: string): QueryObject {
  let queryObject: QueryObject = {
    OR: []
  };

  const buyerOffer = category === 'all' 
    ? { buyerId: userId, type: "buyerOffer" }
    : { buyerId: userId, type: "buyerOffer", status: category };

  const sellerOffer = category === 'all' 
    ? { sellerId: userId, type: "sellerOffer" }
    : { sellerId: userId, type: "sellerOffer", status: category };
  
  queryObject.OR.push({ AND: [buyerOffer] }, { AND: [sellerOffer] });

  return queryObject;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { category, userId, skip, PAGE_SIZE } = req.body;

  if (!category || !userId) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  
  try {
    const query = createQueryObject(userId as string, category as string);
    
    const sent = await prisma.listing.findMany({
      where: query,
      skip: skip ,
      take: PAGE_SIZE ,
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
          }
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
    if (sent.length === 0) {
        return res.status(200).json({ error: "nothing was found" });
      } else {
        return res.status(200).json({ sent });
      }
      
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
