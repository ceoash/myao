import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing, DirectMessage, User } from ".prisma/client";
import { createActivity } from "@/prisma";
import { ExtendedActivity } from "@/interfaces/authenticated";

interface ErrorResponse {
  error: string;
}
interface IListing extends Listing {
  activity?: ExtendedActivity[];
}
interface ListingResponse {
  listing: IListing;
  message?: DirectMessage;
  transactionResult?: any;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<ListingResponse | ErrorResponse>
) {
  const id = req.query.id as string;

  const {
    title,
    description,
    price,
    image,
    buyerId,
    category,
    sellerId,
  } = req.body;

  try {
    const updateListing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        activity: {
          include: {
            listingActivity: true,
            userActivity: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!updateListing)
      return res.status(404).json({ error: "Listing not found" });

    const now = Date.now();

    if (!updateListing) {
      res.status(404).json({ error: "Offer not found" });
      return;
    }

    const listing = await prisma.listing.update({
      where: { id: id },
      include: { seller: true, buyer: true, user: true },
      data: {
        title,
        description,
        price,
        image,
        buyerId,
        sellerId,
        category,
        updatedAt: new Date(now),
      },
    });

    if (!listing) {
      res.status(404).json({ error: "Offer not found" });
      return;
    }

    const buyerActivity = createActivity({
      type: "listing",
      message: "listing updated",
      listing_message: title,
      listing_message_type: "update",
      userId: listing.buyerId || "",
      user_message: "listing updated",
      user_message_type: "listing",
      action: `/dashboard/offers/${listing.id}`,
      receiverId: listing.sellerId || "",
    });

    const sellerActivity = createActivity({
      type: "listing",
      message: "listing updated",
      listing_message: title,
      listing_message_type: "update",
      userId: listing.sellerId || "",
      user_message: "listing updated",
      user_message_type: "listing",
      action: `/dashboard/offers/${listing.id}`,
      receiverId: listing.buyerId || "",
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
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
