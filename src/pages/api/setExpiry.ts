import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function SetExpiry(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
    const { expiry, id } = req.body;

    const now = Date.now();

    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: { expireAt: expiry, updatedAt: new Date(now) },
      });
      res.status(200).json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
