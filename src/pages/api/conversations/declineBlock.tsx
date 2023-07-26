import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Conversation } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function accept(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
      const { user: userBlockedId, user2: friendBlockedId, conversationId } = req.body;
      const now = Date.now()
      if (!userBlockedId || !friendBlockedId) {
          return res.status(400).json({ error: "Missing necessary parameters." });
      }

    try {
      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: "declined", updatedAt: new Date(now) },
      });

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
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ error: "Something went wrong" });
    }

    
  
}
