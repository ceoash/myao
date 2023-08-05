import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function deleteListing(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
  if (req.method === "POST") {
    const { listingId } = req.body;
    
    try {
      await prisma.message.deleteMany({
        where: {
          listingId: listingId,
        }
      });

      const deletedListing = await prisma.listing.delete({
        where: {
          id: listingId,
        },
      });

      res.status(200).json(deletedListing);
    } catch (error) {
      console.error("Error deleting listing and related messages:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
