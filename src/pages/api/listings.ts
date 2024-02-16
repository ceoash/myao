import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { DirectMessage } from ".prisma/client";
import { PrismaClient } from "@prisma/client";
import { createActivity } from "@/prisma";
import { ExtendedActivity } from "@/interfaces/authenticated";
import { da } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

interface ErrorResponse {
  error: string;
}

interface ListingResponse {
  listing: any;
  message?: DirectMessage;
  transactionResult?: ExtendedActivity[];
  participantId?: string;
}

let parsedImg = "";

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<ListingResponse | ErrorResponse>
) {
  const now = Date.now();
  const session = await getServerSession(req, res, authOptions);

  async function createListing(data: any) {
    if (!data)
      return res.status(400).json({ error: "Missing required fields" });

    const session = await getServerSession(req, res, authOptions);

    const listing = await prisma.listing.create({
      data: {
        ...data,
        userId : session?.user?.id,
      },
      include: {
        user: true,
        seller: true,
        buyer: true,
        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!listing)
      return res.status(400).json({ error: "Unable to create listing" });

    if (listing?.image) parsedImg = JSON.parse(listing.image) || null;

    return listing;
  }

  async function createMessage(
    prisma: PrismaClient,
    listing: any,
    conversationId: string,
    type: string | null
  ) {
    const message = await prisma.directMessage.create({
      data: {
        image: parsedImg[0],
        text: "New offer created",
        listingId: listing.id,
        conversationId: conversationId,
        userId: listing.userId,
        type: type || null,
        read: false,
        receiverId:
          listing?.sellerId === listing.userId
            ? listing?.buyerId || ""
            : listing?.sellerId || "",
      },
      include: {
        user: true,
        listing: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
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
          },
        },
      },
    });
    return message;
  }

  if (req.method === "POST") {
    const {
      title,
      description,
      price,
      image,
      sellerId,
      category,
      subcategory,
      buyerId,
      conversationId,
      type,
      userId,
      participantId,
      options,
      additionalInformation,
    } = req.body;

    try {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!userExists) {
        throw new Error("User does not exist");
      }

      let newListingData = {
        title,
        description,
        category,
        sellerId,
        status: "awaiting approval",
        buyerId,
        type,
        options,
      };

      if (subcategory) Object.assign(newListingData, { subcategory });
      if (image) Object.assign(newListingData, { image });
      if (price) Object.assign(newListingData, { price: parseFloat(price) });
      else Object.assign(newListingData, { price: "0" });

      let listingOptions = {
        ...options,
      };

      if (additionalInformation)
        Object.assign(listingOptions, { additionalInformation });
      if (conversationId) Object.assign(listingOptions, { conversationId });
      if (type) Object.assign(listingOptions, { type });
      if (participantId) Object.assign(listingOptions, { participantId });

      let message;

      const listing = await createListing({
        ...newListingData,
        options: listingOptions,
      });

      if (!listing)
        return res.status(400).json({ error: "Unable to create listing" });

      if (conversationId) {
        message = await createMessage(prisma, listing, conversationId, type);
      }

      const sellerActivity = listing?.seller ? createActivity({
        type: "Offer",
        userId: listing?.sellerId,
        message: "New offer created",
        user_message: `${
          listing?.sellerId === userId
            ? `You sent ${listing.buyer?.username} a new offer`
            : `${listing.buyer?.username} sent you a new offer`
        }`,
        user_message_type: "Offer",
        action: "/dashboard/offers/" + listing.id,
        listingId: listing.id,
        listing_message: listing.title || "",
        listing_message_type: "Offer",
        receiverId: listing.buyerId || "",
      }) : {};

      const buyerActivity = listing.buyer ? createActivity({
        type: "Offer",
        userId: listing.buyerId || "",
        message: "New offer created",
        user_message: `${
          listing.buyerId === userId
            ? `You sent ${listing?.seller?.username} a new offer`
            : `${listing.seller?.username} sent you a new offer`
        }`,
        user_message_type: "Offer",
        action: "/dashboard/offers/" + listing.id,
        listingId: listing.id,
        listing_message: listing.title || "",
        listing_message_type: "Offer",
        receiverId: listing?.sellerId,
      }) : {};

      const transactionOperations = [sellerActivity, buyerActivity];

      try {
        const transactionResult = await prisma.$transaction(
          transactionOperations
        );
        res.status(200).json({ listing, transactionResult, message });
      } catch (error) {
        console.error("Transaction failed: ", error);
        res
          .status(500)
          .json({ error: "Something went wrong during the transaction" });
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else if (req.method === "PUT") {
    const { id, userId, ...rest } = req.body;

    let data = {
      ...rest,
    };

    if (!id) {
      res.status(400).json({ error: "Missing listing id" });
      return;
    }

    if (data?.image) parsedImg = JSON.parse(data.image) || null;
    if (data?.options) {
      data.options.pickup = data?.pickup
        ? data.pickup
        : data.options?.pickup
        ? data.options.pickup
        : null;
      data.options.condition = data?.condition
        ? data.condition
        : data.options?.condition
        ? data.options.condition
        : null;
      data.options.location = data?.location
        ? data.location
        : data.options?.location
        ? data.options.location
        : null;
      delete data.pickup;
      delete data.condition;
      delete data.location;
    }
    if (data?.price) data.price = parseFloat(data.price.toString());

    data = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => value !== "" && value !== null
      )
    );

    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: data,
        select: {
          userId: true,
          id: true,
          createdAt: true,
          title: true,
          category: true,
          description: true,
          options: true,
          activity: {
            include: {
              listingActivity: true,
              userActivity: true,
            },
          },
          updatedAt: true,
          buyerId: true,
          sellerId: true,
          image: true,
          status: true,
          seller: {
            select: {
              username: true,
              activity: {
                include: {
                  listing: true,
                  listingActivity: true,
                  userActivity: true,
                },
              },
            },
          },
          buyer: {
            select: {
              username: true,
              activity: {
                include: {
                  listing: true,
                  listingActivity: true,
                  userActivity: true,
                },
              },
            },
          },
          bids: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!listing) {
        res.status(404).json({ error: "Offer not found" });
        return;
      }

      if (listing?.sellerId && listing.buyerId) {
        const sellerActivity = createActivity({
          type: "Offer",
          userId: listing?.sellerId,
          message: "Offer updated",
          user_message: `${
            userId === listing?.sellerId
              ? "Offer updated"
              : `${listing.buyer?.username} updated your offer`
          } `,
          user_message_type: "Offer",
          action: "/dashboard/offers/" + listing.id,
          listingId: listing.id,
          listing_message: listing.title || "",
          listing_message_type: "Offer",
          receiverId: listing.buyerId,
        });

        const buyerActivity = createActivity({
          type: "Offer",
          userId: listing.userId,
          message: "Offer updated",
          user_message: `${
            userId === listing?.sellerId
              ? "Offer updated"
              : `${listing.buyer?.username} updated your offer`
          } `,
          user_message_type: "Offer",
          action: "/dashboard/offers/" + listing.id,
          listingId: listing.id,
          listing_message: listing.title || "",
          listing_message_type: "Offer",
          receiverId: listing?.sellerId,
        });

        const transactionOperations = [sellerActivity, buyerActivity];

        try {
          const transactionResult = await prisma.$transaction(
            transactionOperations
          );
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res
            .status(500)
            .json({ error: "Something went wrong during the transaction" });
        }
      } else {
        res.status(404).json({ error: "Buyer or seller not found" });
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Listing edit not allowed" });
  }
}
