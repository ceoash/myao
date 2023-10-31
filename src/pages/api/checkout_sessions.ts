import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

interface StripeError {
  statusCode: number;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "POST") {
    const {
      title,
      price,
      id,
      senderUsername,
      sellerId,
      receiverUsername,
      buyerId,
      sellerUsername,
      buyerUsername,
    } = req.body;

    console.log(id, price);

    const now = Date.now();

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `${title}`,
              },
              unit_amount: price * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/dashboard/offers/${id}?success=true`,
        cancel_url: `${req.headers.origin}/dashboard/offers/${id}/?canceled=true`,
      });

      await prisma.notification.create({
        data: {
          userId: buyerId || "",
          message: `You paid £${price} to ${
            sellerUsername ? sellerUsername : "unknown"
          }`,
          action: `/dashboard/offers/${id}`,
          type: "listing",
          read: false,
        },
      });

      await prisma.notification.create({
        data: {
          userId: sellerId || "",
          message: `${
            buyerUsername ? buyerUsername : "unknown"
          } has paid you £${price}`,
          action: `/dashboard/offers/${id}`,
          type: "listing",
          read: false,
        },
      });

      res.redirect(303, session.url);
    } catch (err) {
      const error = err as StripeError;
      res.status(error.statusCode || 500).json(error.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
