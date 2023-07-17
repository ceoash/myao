import prisma from "@/libs/prismadb";

export default async function getCategorizedRequestsByUserId(id: any, pageSize: any) {
  try {
    const requests = await prisma.listing.findMany({
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
        bidder: true,
      },
    });
    
    const categorizedRequests: {
      awaitingApproval: any[];
      negotiating: any[];
      accepted: any[];
      rejected: any[];
    } = {
      awaitingApproval: [],
      negotiating: [],
      accepted: [],
      rejected: [],
    };

    for (const listing of requests) {
      const listingWithFormattedDates = {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        expireAt: listing?.expireAt ? listing.expireAt?.toISOString() : null,
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
        bidder: listing.bidder
          ? {
              ...listing.bidder,
              createdAt: listing.bidder.createdAt.toISOString(),
              updatedAt: listing.bidder.updatedAt.toISOString(),
            }
          : null,
      };

      if (listing.status === "awaiting approval") {
        if (categorizedRequests.awaitingApproval) {
          categorizedRequests.awaitingApproval.push(listingWithFormattedDates);
        }
      } else if (listing.status === "negotiating") {
        if (categorizedRequests.negotiating) {
          categorizedRequests.negotiating.push(listingWithFormattedDates);
        }
      } else if (listing.status === "accepted") {
        if (categorizedRequests.accepted) {
          categorizedRequests.accepted.push(listingWithFormattedDates);
        }
      } else if (listing.status === "rejected") {
        if (categorizedRequests.rejected) {
          categorizedRequests.rejected.push(listingWithFormattedDates);
        }
      }
    
    }

    const all = requests.map((listing) => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        expireAt: listing.expireAt ? listing.expireAt?.toISOString() : null,
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
        bidder: listing.bidder
          ? {
              ...listing.bidder,
              createdAt: listing.bidder.createdAt.toISOString(),
              updatedAt: listing.bidder.updatedAt.toISOString(),
            }
          : null,
      }));

    return { categorizedRequests, requests: all };
  } catch (error: any) {
    throw new Error(error);
  }
}
