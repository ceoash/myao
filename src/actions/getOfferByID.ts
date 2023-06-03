import prisma from "@/libs/prismadb";

interface IParams {
  offerID: string;
}

export default async function getOfferByID({ offerID }: IParams) {
  try {
    const bid = await prisma?.listing.findUnique({
      where: {
        id: offerID,
      },
      include: {
        recipient: true,
      },
    });

    if (!bid) {
      throw new Error("Bid not found");
    }
    return {
      ...bid,
      createdAt: bid.createdAt.toISOString(),
      updatedAt: bid.updatedAt.toISOString(),
      expireAt: bid.expireAt?.toISOString() || null,
      user: {
        ...bid.recipient,
        createdAt: bid.recipient?.createdAt.toISOString(),
        updatedAt: bid.recipient?.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
