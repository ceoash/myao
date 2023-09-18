import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const conversationId = req.query.conversationId as string;
  const listingId = req.query.listingId as string;
  const userId = req.query.userId as string;
  console.dir(req.query);
  if (!conversationId || !listingId) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  try {
    if(conversationId){
      const count = await prisma.directMessage.updateMany({
        where: {
          conversationId
        },
        data: {
          read: true
        }
      });
  
      return res.status(200).json({ count });
    }
    if(listingId){
      const messages = await prisma.message.updateMany({
        where: {
          listingId,
          read: false,
          sellerId: userId
        },
        data: {
          read: true
        },
      });
  
      return res.status(200).json({ messages });
    }

  } catch (error) {
    console.error("Error updating unread messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
