import prisma from "@/libs/prismadb";

export default async function getListingsByUserId(id: any) {
  try {
    const listings = await prisma?.listing.findMany({
      where: {
        senderId: id, // filter by the userId
      },
      orderBy: {
        createdAt: "desc",
      },

      include: {
        sender: true,
        recipient: true,
        messages: true,
      },
    });

    const safeListings = listings?.map((listing) => ({
      ...listing,
      expireAt: listing.createdAt.toISOString(),
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      recipient: listing.recipient
        ? {
            ...listing.recipient,
            createdAt: listing.recipient.createdAt
              ? listing.recipient.createdAt.toISOString()
              : null,
            updatedAt: listing.recipient.updatedAt
              ? listing.recipient.updatedAt.toISOString()
              : null,
          }
        : null,
      sender: {
        ...listing.sender,
        createdAt: listing.sender.createdAt.toISOString(),
        updatedAt: listing.sender.updatedAt.toISOString(),
      },
      messages: listing.messages?.map((message) => ({
        ...message,
        createdAt: message.createdAt?.toISOString(),
        updatedAt: message.updatedAt?.toISOString(),
      })),
    }));
    return safeListings;
  } catch (error: any) {
    throw new Error(error);
  }
}
