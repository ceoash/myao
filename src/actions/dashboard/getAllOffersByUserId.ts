import prisma from "@/libs/prismadb";

export default async function getAllOffersByUserId(
  session: any,
  PAGE_SIZE: number,
  blocked?: { friendBlockedId: string, id: string }[]
) {
  if (!session?.user?.email) {
    console.log("No session found");
    return null;
  }
  
  const id = session?.user.id;
  const blockedIds = blocked?.map((blocker: { friendBlockedId: string }) => blocker.friendBlockedId);
  
  try {
    const fetchListings = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              {
                sellerId: {
                  notIn: blocked?.map((blocker: { friendBlockedId: string }) => blocker.friendBlockedId),
                },
              },
            ],
          },
          {
            AND: [
              { sellerId: id },
              {
                buyerId: {
                  notIn: blocked?.map((blocker: { friendBlockedId: string }) => blocker.friendBlockedId),
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: PAGE_SIZE || 4,
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
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    

    const countSent = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "buyerOffer" },
              {
                sellerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "sellerOffer" },
              {
                buyerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
        ],

      },
    });

    const countPendingSent = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "buyerOffer" },
              { status: "awaiting approval" },
              {
                sellerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "sellerOffer" },
              { status: "awaiting approval" },
              {
                buyerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
        ],
      },
    });

    const countReceived = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "sellerOffer" },
              {
                sellerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "buyerOffer" },
              {
                buyerId: {
                  notIn: blockedIds,
                },
              },

            ],
          },
        ],
      },
    });
    
    const countPendingReceived = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "sellerOffer" },
              { status: "awaiting approval" },
              {
                sellerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "buyerOffer" },
              { status: "awaiting approval" },
              {
                buyerId: {
                  notIn: blockedIds,
                },
              },
            ],
          },
        ],
      },
    });

    const listings = fetchListings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expireAt: listing.expireAt ? listing.expireAt?.toISOString() : null,
      bids: listing.bids.map((bid) => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(),
        updatedAt: bid.updatedAt.toISOString(),
      })),
    }));
    

    return { listings, countSent, countPendingSent, countReceived, countPendingReceived };
  } catch (error: any) {
    throw new Error(error);
  }
}
