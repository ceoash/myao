import prisma from "@/libs/prismadb";

interface IParams {
  offerId: string;
  userId?: string;
}

export default async function getListingById({ offerId, userId }: IParams) {
  let where = {
    id: offerId,
  };
  if (userId) {
   Object.assign(where, { userId });
  }
  try {
    const bid = await prisma?.listing.findUnique({
      where: {
        id: offerId,
      },
      include: {
        buyer: {
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
        seller: {
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
        bids: {
          select: {
            id: true,
            price: true,
            createdAt: true,
            previous: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,               
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true
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
                profile: {
                  select: {
                    image: true,
                  },
                },
            },},
            createdAt: true,
            updatedAt: true,
            
          },
        },
        activity: {
          where: userId ? { userId } : {},
          select: {
            id: true,
            type: true,
            message: true,
            createdAt: true,
            listingActivity: {
              select: {
                message: true,
                type: true,
                receiverId: true,
              },
            },
          },
        },
        reviews: {
          take: 2,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,                
              },
            },
          },
        },
      },
    });

    if (!bid) throw new Error("Offer not found");

    return {
      ...bid,
      createdAt: bid.createdAt.toISOString(),
      updatedAt: bid.updatedAt.toISOString(),
      expireAt: bid.expireAt?.toISOString() || null,
      reviews: bid.reviews.map((review) => ({
        ...review,
        createdAt: review.createdAt.toISOString(),
      })),
      activity: bid.activity.map((activity) => ({
        ...activity,
        createdAt: activity.createdAt.toISOString(),
      })),
      messages: bid.messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),

      })),
      bids: bid.bids.map((bid) => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
