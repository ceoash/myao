import prisma from "@/libs/prismadb";

interface IParams {
  listingId: string;
  userId: string;
}

export default async function assignUserToListing({
  listingId,
  userId,
}: IParams) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) {
        throw new Error("Listing not found");
      }
  
    

    let updatedListing;

    if (listing?.type === "sale" ) {
    updatedListing = await prisma.listing.update({
        where: {
          id: listingId,
        },
        data: {
          sellerId: userId,
        },
      });
    }
    else {
    updatedListing = await prisma.listing.update({
        where: {
          id: listingId,
        },
        data: {
          buyerId: userId,
        },
      });
    }

   return {
      ...updatedListing,
      createdAt: updatedListing.createdAt.toISOString(),
      updatedAt: updatedListing.updatedAt.toISOString(),
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
