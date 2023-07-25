import prisma from "@/libs/prismadb";

export default async function getOffersByUserId(
  session: any,
  PAGE_SIZE: number
) {
  if (!session?.user?.email) {
    console.log("No session found");
    return null;
  }
  const id = session.user.id;
  try {
    const recentListingsSent = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [{ buyerId: id }, { type: "buyerOffer" }],
          },
          {
            AND: [{ sellerId: id }, { type: "sellerOffer" }],
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
      },
    });

    const recentListingsReceived = await prisma.listing.findMany({
      where: {
        OR: [
          {
            AND: [{ buyerId: id }, { type: "sellerOffer" }],
          },
          {
            AND: [{ sellerId: id }, { type: "buyerOffer" }],
          },
        ],
      },
      take: PAGE_SIZE || 4,
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

    const countSent = await prisma?.listing.count({
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
    });
    const countPendingSent = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "buyerOffer" },
              { status: "awaiting approval" },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "sellerOffer" },
              { status: "awaiting approval" },
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
    });
    const countPendingReceived = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "sellerOffer" },
              { status: "awaiting approval" },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "buyerOffer" },
              { status: "awaiting approval" },
            ],
          },
        ],
      },
    });

    const received = recentListingsReceived.map((listing) => ({
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
    const sent = recentListingsSent.map((listing) => ({
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

    return { received, sent, countSent, countPendingSent, countReceived, countPendingReceived };
  } catch (error: any) {
    throw new Error(error);
  }
}
