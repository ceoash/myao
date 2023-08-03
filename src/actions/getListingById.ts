import prisma from "@/libs/prismadb";

interface IParams {
  offerId: string;
}

export default async function getListingById({ offerId }: IParams) {
  try {
    const bid = await prisma?.listing.findUnique({
      where: {
        id: offerId,
      },
      include: {
        buyer: {
          include: {
            profile: true,
          },
        },
        seller: {
          include: {
            profile: true,
          },
        },
        bids: {
          include: {
            user: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
        messages: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            text: true,
            image: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
            },},
            createdAt: true,
            updatedAt: true,
            
          },
        },
        reviews: {
          take: 2,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(bid?.reviews);

    if (!bid) {
      throw new Error("Bid not found");
    }

    return {
      ...bid,
      createdAt: bid.createdAt.toISOString(),
      updatedAt: bid.updatedAt.toISOString(),
      expireAt: bid.expireAt?.toISOString() || null,
      seller: {
        ...bid.seller,
        createdAt: bid.seller?.createdAt.toISOString(),
        updatedAt: bid.seller?.updatedAt.toISOString(),
      },
      user: {
        ...bid.user,
        createdAt: bid.user?.createdAt.toISOString(),
        updatedAt: bid.user?.updatedAt.toISOString(),
      },
      buyer: bid.buyer
        ? {
            ...bid.buyer,
            createdAt: bid.buyer.createdAt.toISOString(),
            updatedAt: bid.buyer.updatedAt.toISOString(),
          }
        : null,

      reviews: bid.reviews.map((review) => ({
        ...review,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: {
          ...review.user,
          createdAt: review.user.createdAt.toISOString(),
          updatedAt: review.user.updatedAt.toISOString(),
        },
      })),
      messages: bid.messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),

      })),
      bids: bid.bids.map((bid) => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(),
        updatedAt: bid.updatedAt.toISOString(),
        user: {
          ...bid.user,
          createdAt: bid.user.createdAt.toISOString(),
          updatedAt: bid.user.updatedAt.toISOString(),
        },
      })),
    };
  } catch (error: any) {
    throw new Error(error);
  }
}