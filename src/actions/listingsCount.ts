import prisma from "@/libs/prismadb";

export default async function listingsCount(id: any,) {
  try {
    
    const sentListingsCount = await prisma?.listing.count({
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
    const receivedListingsCount = await prisma?.listing.count({
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

    return {sentListingsCount, receivedListingsCount};
      
  } catch (error: any) {
    throw new Error(error);
  }
}
