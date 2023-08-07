import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Conversation } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function ConversationsApi(
  req: NextApiRequest,
  res: NextApiResponse<Conversation | ErrorResponse>
) {

  const now = Date.now()

  if (req.method === "POST") {

    const { 
      userId, 
      text, 
      id, 
      image, 
      date, 
      type 
    } = req.body;

    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: id },
        select: { 
          participant1: true, 
          participant2: true 
        }
      });

     
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      const newActivity = { 
        type: "New Conversation Message", 
        message: "You have a message", 
        action: `/dashboard/conversations?conversationId=${id}`, 
        modelId: id,
        userId: userId,
        createdAt: now,
        value: `${userId === conversation.participant1.id ? conversation.participant1.username : conversation.participant2.username}`,
      };

      if(userId === conversation.participant1.id){
        const updatedConversation = await prisma.conversation.update({
          where: { id: id },
          data: {
            updatedAt: new Date(now),
            directMessages: {
              create: {
                userId: userId,
                text: text,
                image: image,
                type: type || "text",
              },
            },
            participant2: {
              update: {
                activities: [
                  ...(Array.isArray(conversation.participant2.activities) ? conversation.participant2.activities : []), 
                  newActivity
                ]
              }
            }
          },
          include: {
            directMessages: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        });
        res.status(200).json(updatedConversation);

      } else {

        const updatedConversation = await prisma.conversation.update({
          where: { id: id },
          data: {
            updatedAt: new Date(now),
            directMessages: {
              create: {
                userId: userId,
                text: text,
                image: image,
                type: type || "text",
              },
            },
            participant1: {
              update: {
                activities: [
                  ...(Array.isArray(conversation.participant1.activities) ? conversation.participant1.activities : []), 
                  newActivity
                ]
              }
            },
            
          },
          include: {
            directMessages: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        });
        res.status(200).json(updatedConversation);
      }

      

     
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
