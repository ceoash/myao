import prisma from "@/libs/prismadb";

interface IParams {
  id: string;
}

export default async function getBidByID({ id }: IParams) {
  try {
    const bids = await prisma?.bid.findMany({
      where: {
        listingId: id,
      },
      select: {
        id: true,
        previous: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    });

    if (!bids) {
      throw new Error("Bids not found");
    }

    return bids.map((bid) => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(),
        updatedAt: bid.updatedAt.toISOString(),
    }));
            
  } catch (error: any) {
    throw new Error(error);
  }
}
