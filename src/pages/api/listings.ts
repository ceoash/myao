import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing, DirectMessage, User } from ".prisma/client";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { createActivityForUser } from "@/prisma";
import { da } from "date-fns/locale";

interface ErrorResponse {
  error: string;
}

interface ListingResponse {
  listing: Listing;
  message?: DirectMessage;
  transactionResult?: User[];
  participantId?: string;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<ListingResponse | ErrorResponse>
) {
  const now = Date.now()

  async function createListing(data: any) {

    if(!data) return res.status(400).json({ error: "Missing required fields" })

    data.activities = [{ type: "Listing Created", message: "Listing Created", createdAt: now, userId: data.userId }]

    const listing = await prisma.listing.create({
      data: data,
      include: {
        seller: true,
        buyer: true,
        bidder: true,
      },
    });

    const participantId = listing.userId === listing.buyerId ? listing.sellerId : listing.buyerId;

    const newActivity = {
      type: "New Offer",
      message: "New Offer",
      action: "/dashboard/offers/" + listing.id,
      modelId: participantId,
      createdAt: now
    };

    let activities = Array.isArray(listing.activities)
      ? listing.activities
      : [];

    activities.push(newActivity);

    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        activities: activities,
      },
      include: {
        buyer: true,
        seller: true,
        bidder: true,
        user: true,
      },
    });

    return updatedListing;
  }

  async function createMessage(
    prisma: PrismaClient,
    listing: any,
    conversationId: string,
    type: string | null
  ) {
    const message = await prisma.directMessage.create({
      data: {
        image: listing.image,
        text: "New offer created",
        listingId: listing.id,
        conversationId: conversationId,
        userId: listing.userId,
        type: type || null,
      },
      include: {
        user: true,
        listing: {
          include: {
            user: {
              include: {
                profile: true
              }
            },
            buyer: {
              include: {
                profile: true
              }
            },
            seller: {
              include: {
                profile: true
              }
            }
          }
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
      buyerId,
      bidderId,
      conversationId,
      type,
      userId,
      participantId,
    } = req.body;

    console.log(req.body)

    try {
      const newListingData = {
        title,
        description,
        category,
        price,
        image,
        sellerId,
        status: "awaiting approval",
        buyerId,
        bidderId,
        userId,
        type,
      };

      let message;


      const listing = await createListing(newListingData);
      if (conversationId) {
        message = await createMessage(prisma, listing, conversationId, type);
      }

      const ownerId = listing?.type === 'buyerOffer' ? listing?.buyerId : listing?.sellerId;

      const buyerActivity = {
        type: "New Offer",
        message: `${listing?.type === 'buyerOffer' && listing.userId === listing.buyerId ? `You sent ${listing?.seller.username} a offer` : `${listing?.buyer?.username} sent you a offer`} `,
        action: "/dashboard/offers/" + listing?.id,
        modelId: listing?.id,
        createdAt: now,
        value: listing?.status,
        userId: ownerId,
      };
  
      const sellerActivity = {
        type: "New Offer",
        message: `${listing?.type === 'sellerOffer' && listing.userId === listing.sellerId ? `You sent ${listing?.buyer?.username} a offer` : `${listing?.seller.username} sent you a offer`} `,
        action: "/dashboard/offers/" + listing?.id,
        modelId: listing?.seller?.id,
        createdAt: now,
        value: listing?.status,
        userId: ownerId
      };
  
      if (listing?.sellerId && listing.buyerId) {
        const seller = createActivityForUser(listing.sellerId, sellerActivity, listing.seller.activities);
        const buyer = createActivityForUser(listing.buyerId, buyerActivity, listing?.buyer?.activities);
        const transactionOperations = [seller, buyer];
        
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, message, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } else if (listing?.user) {
        const seller = createActivityForUser(listing.sellerId, sellerActivity, listing?.seller.activities);
        const transactionOperations = [seller];
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, message, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      }
      
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else if (req.method === "PUT") {
    const id = req.query.id as string;
    const { title, description, price, image, buyerId, category, sellerId, type } = req.body;

    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: { title, description, category, price, image, buyerId, sellerId, type },
        include: {
          buyer: true,
          seller: true,
          user: true,
        },
      });

      if (!listing) {
        res.status(404).json({ error: "Offer not found" });
        return;
      }

      const ownerId = listing?.type === 'sale' ? listing?.buyerId : listing?.sellerId;

      const buyerActivity = {
        type: "Offer",
        message: `${listing?.seller?.username} updated your offer`,
        action: "/dashboard/offers/" + listing.id,
        modelId: listing.id,
        createdAt: now,
        value: listing.status,
        userId: ownerId
      };
      const sellerActivity = {
        type: "Offer",
        message: `You updated your offer`,
        action: "/dashboard/offers/" + listing.id,
        modelId: listing?.id,
        createdAt: now,
        value: listing.status,
        userId: ownerId
      };

      if (listing?.sellerId && listing.buyerId) {
        const seller = createActivityForUser(listing.sellerId, sellerActivity, listing.seller.activities);
        const buyer = createActivityForUser(listing.buyerId, buyerActivity, listing.buyer?.activities);
        const transactionOperations = [seller, buyer];
        
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
        }
      } else if (ownerId) {
        const seller = createActivityForUser(listing.userId, sellerActivity, listing.user.activities);
        const transactionOperations = [seller];
        try {
          const transactionResult = await prisma.$transaction(transactionOperations);
          res.status(200).json({ listing, transactionResult });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res.status(500).json({ error: "Something went wrong during the transaction" });
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
