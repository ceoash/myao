import { ErrorResponse } from "@/components/modals/UserSearchModal";
import { Message } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function messagesApi(
    req: NextApiRequest,
    res: NextApiResponse<Message[] | ErrorResponse>
  ) {
    if (req.method === "GET") {
      const { listingId } = req.query;
  
      try {
        const messages = await prisma.message.findMany({
          where: { listingId: String(listingId) },
          include: {
            buyer: true,
            seller: true,
            listing: true,
            user: {
              include: {
                profile: true,
              }
            },
          },
          orderBy: { createdAt: 'asc' },
        });
  
        res.status(200).json(messages);
      } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ error: "Something went wrong" });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  }