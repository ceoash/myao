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
    ? { buyerId: userId, type: "seller" }
    : { buyerId: userId, type: "seller", status: category };

  const sellerOffer = category === 'all' 
    ? { sellerId: userId, type: "buyer" }
    : { sellerId: userId, type: "buyer", status: category };
  
  queryObject.OR.push({ AND: [sellerOffer] }, { AND: [buyerOffer] });

  return queryObject;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { category, userId, skip, PAGE_SIZE } = req.body;

  if (!category || !userId) return res.status(400).json({ error: "Missing necessary parameters." });
  
  const query = createQueryObject(userId as string, category as string);
    
  try {
    const received = await prisma.listing.findMany({
      where: query,
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
        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
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
