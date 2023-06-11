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
              buyer: true,
              seller: true,
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
          };         
          
          
    } catch (error: any) {
        throw new Error(error)
    }
    }