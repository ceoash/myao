import prisma from "@/libs/prismadb";

export default async function listingsCount(id: any,) {
  try {
    
    const sentListingsCount = await prisma?.listing.count({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "buyer" },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "seller" },
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
              { type: "seller" },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "buyer" },
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
