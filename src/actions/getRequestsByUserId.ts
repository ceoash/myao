import prisma from '@/libs/prismadb'

export default async function getRequestsByUserId(id: any) {
  try {
    const listings = await prisma?.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { sellerId: id },
              { type: "buyerOffer" },
            ],
          },
          {
            AND: [
              { buyerId: id },
              { type: "sellerOffer" },
            ],
          },
        ],
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            buyer: true,      
            seller: true,   
            messages: true,
        }
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
      messages: listing.messages
        ? listing.messages.map(message => ({
            ...message,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
          }))
        : [],
     
    }));
  } catch (error: any) {
    throw new Error(error)
  }
}
