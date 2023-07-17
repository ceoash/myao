import prisma from "@/libs/prismadb";

export default async function getCategorizedListingsByUserId(
  id: any,
  pageSize: any
) {
  try {
    const recentListingsSent = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "buyerOffer" },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "sellerOffer" },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
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
    
    const recentListingsReceived = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "sellerOffer" },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "buyerOffer" },
            ],
          },
        ],
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            username: true,
            profile: {
              select: {
                image: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
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
  
    const received = recentListingsReceived.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expireAt: listing.expireAt ? listing.expireAt?.toISOString() : null,
    }));
    const sent = recentListingsSent.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expireAt: listing.expireAt ? listing.expireAt?.toISOString() : null,
    }));

    return { received, sent };
  } catch (error: any) {
    throw new Error(error);
  }
}
