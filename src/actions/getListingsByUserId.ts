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
        bidder: true,
      },
    });

    return listings.map(listing => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expireAt: listing.expireAt?.toISOString() || null,
      buyer: listing.buyer
          ? {
              ...listing.buyer,
              createdAt: listing.buyer.createdAt.toISOString(),
              updatedAt: listing.buyer.updatedAt.toISOString(),
            }
          : null,
      seller: {
        ...listing.seller,
        createdAt: listing.seller.createdAt.toISOString(),
        updatedAt: listing.seller.updatedAt.toISOString(),
      },
      bidder: listing.bidder
        ? {
            ...listing.bidder,
            createdAt: listing.bidder.createdAt.toISOString(),
            updatedAt: listing.bidder.updatedAt.toISOString(),
          }
        : null,
  }));
  } catch (error: any) {
    throw new Error(error);
  }
}
