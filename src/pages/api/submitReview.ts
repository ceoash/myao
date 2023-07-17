import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivityForUser } from "@/prisma";

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
          listing: {
            select: {
              title: true,
              sellerId: true,
              buyerId: true,
              seller: {
                select: {
                    activities: true
                }
              },
              buyer: {
                select: {
                    activities: true
                }
              }
            },
          },
        },
      });

      const now = Date.now();

      const sellerActivity = {
        type: "ReviewSubmitted",
        message: `New review`,
        action: "/dashboard/offers/" + listingId,
        modelId: review.id,
        value: review.listing.title,
        userId: review.userId,
        createdAt: now,
      };
      const buyerActivity = {
        type: "ReviewSubmitted",
        message: `New review`,
        action: "/dashboard/offers/" + listingId,
        modelId: review.id,
        value: review.listing.title,
        userId: review.userId,
        createdAt: now,
      };

      const sellerUpdate = createActivityForUser(
        review?.listing.sellerId,
        sellerActivity,
        review?.listing.seller?.activities
      );
      const buyerUpdate = createActivityForUser(
        review?.listing?.buyerId || "",
        buyerActivity,
        review?.listing?.seller?.activities
      );

      const transactionOperations = [sellerUpdate, buyerUpdate];

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
