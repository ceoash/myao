import prisma from "@/libs/prismadb";
import { Conversation, Blocked } from ".prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface ErrorResponse {
  error: string;
}

export default async function accept(
  req: NextApiRequest,
  res: NextApiResponse<{
    conversation: Conversation;
    newFriendshipBlock?: Blocked;
  } | ErrorResponse>
) {
    const { userBlockedId, friendBlockedId, conversationId, status } = req.body;
    const now = Date.now()
    
    try {
      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: status, updatedAt: new Date(now) },
      });
      
      if (userBlockedId || friendBlockedId) {
        const newFriendshipBlock = await prisma.blocked.upsert({
          where: { userBlockedId_friendBlockedId: { userBlockedId, friendBlockedId } },
          update: {
              userBlockedId,
              friendBlockedId,
          },
          create: {
              userBlockedId,
              friendBlockedId,
          },
        });
        

        res.status(200).json({conversation, newFriendshipBlock});
      }

    res.status(200).json({conversation});
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
