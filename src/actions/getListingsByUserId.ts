import prisma from "@/libs/prismadb";

export default async function getListingsByUserId(id: any) {
  try {
    const listings = await prisma?.listing.findMany({
      where: {
        sellerId: id, // filter by the userId
      },
      orderBy: {
        createdAt: "desc",
      },

      include: {
        buyer: true,
        seller: true,
        messages: true,
      },
    });

    const safeListings = listings?.map((listing) => ({
      ...listing,
      expireAt: listing.createdAt.toISOString(),
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      buyer: listing.buyer
        ? {
            ...listing.buyer,
            createdAt: listing.buyer.createdAt
              ? listing.buyer.createdAt.toISOString()
              : null,
            updatedAt: listing.buyer.updatedAt
              ? listing.buyer.updatedAt.toISOString()
              : null,
          }
        : null,
      seller: {
        ...listing.seller,
        createdAt: listing.seller?.createdAt.toISOString(),
        updatedAt: listing.seller.updatedAt.toISOString(),
      },
      messages: listing.messages?.map((message) => ({
        ...message,
        createdAt: message.createdAt?.toISOString(),
        updatedAt: message.updatedAt?.toISOString(),
      })),
    }));
    return safeListings;
  } catch (error: any) {
    throw new Error(error);
  }
}
