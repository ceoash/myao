import prisma from "@/libs/prismadb";

export default async function getListingsPaginatedByUserId(id: any, page: any, pageSize: any) {
  try {
    const listings = await prisma.listing.findMany({
        where: {
          sellerId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          buyer: {
            include: {
              buyer: true,
              seller: true,
            },
          },
          seller: {
            include: {
              buyer: true,
              seller: true,
            },
          },
          messages: true,
        },
      });
      
    const updatedListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expireAt: listing.expireAt?.toISOString() || null,
      buyer: listing.buyer
        ? {
            ...listing.buyer,
            createdAt: listing.buyer.createdAt.toISOString(),
            updatedAt: listing.buyer.updatedAt.toISOString(),
            buyer: listing.buyer.buyer.map((buyer) => ({
              ...buyer,
              createdAt: buyer.createdAt.toISOString(),
              updatedAt: buyer.updatedAt.toISOString(),
            })),
            seller: listing.buyer.seller.map((seller) => ({
              ...seller,
              createdAt: seller.createdAt.toISOString(),
              updatedAt: seller.updatedAt.toISOString(),
            })),
          }
        : null,
      seller: {
        ...listing.seller,
        createdAt: listing.seller.createdAt.toISOString(),
        updatedAt: listing.seller.updatedAt.toISOString(),
        buyer: listing.seller.buyer.map((buyer) => ({
          ...buyer,
          createdAt: buyer.createdAt.toISOString(),
          updatedAt: buyer.updatedAt.toISOString(),
        })),
        seller: listing.seller.seller.map((seller) => ({
          ...seller,
          createdAt: seller.createdAt.toISOString(),
          updatedAt: seller.updatedAt.toISOString(),
        })),
      },
      messages: listing.messages
        ? listing.messages.map((message) => ({
            ...message,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
          }))
        : [],
    
    }));

    return {
      updatedListings,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
