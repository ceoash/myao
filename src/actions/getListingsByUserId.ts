import prisma from "@/libs/prismadb";

export default async function getListingsByUserId(id: any,) {
  try {
    const listings = await prisma?.listing.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: id },
              { type: "buyerOffer" },
              { userId: id },
            ],
          },
          {
            AND: [
              { sellerId: id },
              { type: "sellerOffer" },
              { userId: id },
            ],
          },
        ],
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        buyer: {
          include: {
            buyer: true,
            seller: true,
          }
        },
        seller: {
          include: {
            buyer: true,
            seller: true,
          }
        },
        user: {
          include: {
            buyer: true,
            seller: true,
          }
        },
        messages: true,
        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        }

      },
    });


    return listings.map(listing => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expireAt: listing.expireAt?.toISOString() || null,
      bids: listing.bids.map(bid => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(),
        updatedAt: bid.updatedAt.toISOString(),
      })),
      buyer: listing.buyer
        ? {
          ...listing.buyer,
          createdAt: listing.buyer.createdAt.toISOString(),
          updatedAt: listing.buyer.updatedAt.toISOString(),
          buyer: listing.buyer.buyer.map(buyer => ({
            ...buyer,
            createdAt: buyer.createdAt.toISOString(),
            updatedAt: buyer.updatedAt.toISOString(),
          })),
          seller: listing.buyer.seller.map(seller => ({
            ...seller,
            createdAt: seller.createdAt.toISOString(),
            updatedAt: seller.updatedAt.toISOString(),
          })),
        }
        : null,
      seller: listing.seller ? {
        ...listing?.seller,
        createdAt: listing.seller.createdAt.toISOString(),
        updatedAt: listing.seller.updatedAt.toISOString(),
        buyer: listing.seller.buyer.map(buyer => ({
          ...buyer,
          createdAt: buyer.createdAt.toISOString(),
          updatedAt: buyer.updatedAt.toISOString(),
        })),
        seller: listing.seller.seller.map(seller => ({
          ...seller,
          createdAt: seller.createdAt.toISOString(),
          updatedAt: seller.updatedAt.toISOString(),
        })),
      } : null,
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        buyer: listing.user.buyer.map(buyer => ({
          ...buyer,
          createdAt: buyer.createdAt.toISOString(),
          updatedAt: buyer.updatedAt.toISOString(),
        })),
        seller: listing.user.seller.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
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
    throw new Error(error);
  }
}
