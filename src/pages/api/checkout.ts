import { NextApiRequest, NextApiResponse } from "next";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: '2023-08-16' });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>
) {
  if (req.method === "POST") {
    const { listing } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: listing.price,
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
          });

          res.redirect(303, session.url || "/");

    } catch (err) {
      return res.status(400).json({ error: err});
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
