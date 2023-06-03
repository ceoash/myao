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
              sender: true,
              recipient: true,
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
            sender: {
              ...bid.sender,
              createdAt: bid.sender.createdAt.toISOString(),
              updatedAt: bid.sender.updatedAt.toISOString(),
            },
            recipient: bid.recipient
              ? {
                  ...bid.recipient,
                  createdAt: bid.recipient.createdAt.toISOString(),
                  updatedAt: bid.recipient.updatedAt.toISOString(),
                }
              : null,
          };         
          
          
    } catch (error: any) {
        throw new Error(error)
    }
    }