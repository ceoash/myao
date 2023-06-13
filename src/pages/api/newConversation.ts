import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

interface ErrorResponse {
  error: string;
}

export default async function newConversation(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method === "POST") {
    const { message, userId, recipientId, username } = req.body;

    let participant1Id;
    let participant2Id;

    if (username) {
      const participant1 = await prisma.user.findUnique({ where: { username } });
      if (!participant1) {
        return res.status(404).json({ error: "Participant1 not found" });
      }
      participant1Id = participant1.id;
      participant2Id = userId;
    } else {
      participant1Id = userId;
      participant2Id = recipientId;
    }

    try {
      // Try to find an existing conversation between these two users
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: participant1Id, participant2Id: participant2Id },
            { participant1Id: participant2Id, participant2Id: participant1Id }
          ]
        },
        include: { directMessages: true },
      });

      if (existingConversation) {
        // If a conversation exists, add a new message to it
        const updatedConversation = await prisma.conversation.update({
          where: {
            id: existingConversation.id,
          },
          data: {
            directMessages: {
              create: {
                userId: userId,
                text: message,
              },
            },
            updatedAt: new Date(), // Update the updatedAt field of the conversation
          },
          include: {
            directMessages: true, // Include messages
          },
        });
        res.status(200).json(updatedConversation);
      } else {
        // If no conversation exists, create a new one
        const newConversation = await prisma.conversation.create({
          data: {
            participant1Id,
            participant2Id,
            directMessages: {
              create: {
                userId,
                text: message,
              },
            },
          },
          include: { directMessages: true },
        });
        res.status(200).json(newConversation);
      }
    } catch (error) {
      console.error("Error creating conversation or message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
