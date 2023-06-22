// pages/api/checkConversation.ts
import prisma from "@/libs/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function checkConversation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, recipientId } = req.query;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: userId as string,
            participant2Id: recipientId as string,
          },
          {
            participant1Id: recipientId as string,
            participant2Id: userId as string,
          },
        ],
        
      },
      include: { directMessages: true, participant1: true, participant2: true },
    });

    const conversationExists = conversation;

    res.status(200).json(conversationExists);
  } catch (error) {
    console.error("Error checking conversation:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
