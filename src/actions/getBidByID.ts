import prisma from '@/libs/prismadb'

interface IParams {
    bidId: string
}

export default async function getBidByID({ bidId }: IParams) {
    try {
        const bid = await prisma?.listing.findUnique({
            where: {
              id: bidId,
            },
            include: {
              buyer: {
                include: {
                  profile: true,
                }
              },
              seller: {
                include: {
                  profile: true,
                }
              },
              bidder: {
                include: {
                  profile: true,
                }
              },
            },
          });
          
          if (!bid) {
            throw new Error('Bid not found');
          }
          
          return {
            ...bid,
            createdAt: bid.createdAt.toISOString(), // Convert to ISO string
            updatedAt: bid.updatedAt.toISOString(),
            expireAt: bid.expireAt?.toISOString() || null,
            seller: {
              ...bid.seller,
              createdAt: bid.seller?.createdAt.toISOString(),
              updatedAt: bid.seller?.updatedAt.toISOString(),
            },
            buyer: bid.buyer
              ? {
                  ...bid.buyer,
                  createdAt: bid.buyer.createdAt.toISOString(),
                  updatedAt: bid.buyer.updatedAt.toISOString(),
                }
              : null,
            bidder: bid.bidder
              ? {
                  ...bid.bidder,
                  createdAt: bid.bidder.createdAt.toISOString(),
                  updatedAt: bid.bidder.updatedAt.toISOString(),
                }
              : null,
          };         
          
          
    } catch (error: any) {
        throw new Error(error)
    }
    }