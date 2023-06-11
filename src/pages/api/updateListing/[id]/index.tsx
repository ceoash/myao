import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
  
    const id = req.query.id as string;
    const { title, description, price, image, buyerId, category } = req.body;

    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: { title, description, category, price, image, buyerId },
      });


      res.status(200).json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
