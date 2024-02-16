import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivity } from "@/prisma";

export default async function submitReview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, listingId, message, rating } = req.body;

    try {
      const review = await prisma.review.create({
        data: {
          userId,
          listingId,
          rating,
          message,
        },
        include: {
          user: {
            select: {
              username: true,
              id: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              sellerId: true,
              buyerId: true,
              seller: {
                select: {
                    username: true,
                }
              },
              buyer: {
                select: {
                    username: true,
                }
              },
              user: true,
            },
          },
        },
      });


      if (!review) {
        res.status(404).json({ error: "Review not created" });
        return;
      }

      const now = Date.now();

      const buyerActivity = createActivity({
        type: "listing",
        message: `New review ${review.userId === review.listing.buyerId ? "You" : review?.user?.username}`,
        listing_message: review.listing.title || "",
        listing_message_type: "bid",
        userId: review.listing.buyerId || "",
        user_message: "New bid",
        user_message_type: "submit review",
        action: `/dashboard/trades/${review.listing.id}`,
        receiverId: review.listing.sellerId || "",
      });

      const sellerActivity = createActivity({
        type: "listing",
        message: `New review by ${review.userId === review.listing.sellerId ? "You" : review?.user?.username}`,
        listing_message: review.listing.title || "",
        listing_message_type: "review",
        userId: review.listing.sellerId || "",
        user_message: "New review",
        user_message_type: "submit review",
        action: `/dashboard/trades/${review.listing.id}`,
        receiverId: review.listing.buyerId || "",
      });

      const transactionOperations = [sellerActivity, buyerActivity];

      try {
        const transactionResult = await prisma.$transaction(
          transactionOperations
        );
        res.status(200).json({ review, transactionResult });
      } catch (error) {
        res.status(404).json({ error: "Something went wrong" });
      }
    } catch (error) {
      console.error("Error creating view:", error);
      res.status(500).json({ error: "Something went wrong." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
