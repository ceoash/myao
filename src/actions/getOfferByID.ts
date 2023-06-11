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
        seller: true,
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
        ...bid.seller,
        createdAt: bid.seller?.createdAt.toISOString(),
        updatedAt: bid.seller?.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
