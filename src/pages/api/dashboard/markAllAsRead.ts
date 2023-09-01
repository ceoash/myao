import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const conversationId = req.query.conversationId as string;

  if (!conversationId) {
    return res.status(400).json({ error: "Conversation ID is required" });
  }

  try {
    const count = await prisma.directMessage.updateMany({
      where: {
        conversationId
      },
      data: {
        read: true
      }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error updating unread messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
