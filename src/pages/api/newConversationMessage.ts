import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Conversation } from ".prisma/client";

interface ErrorResponse { error: string }

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
      type 
    } = req.body;

    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: id },
        select: { 
          participant1: { include: {
            activity: true
          }}, 
          participant2: { include: {
            activity: true
          }}, 
        }
      });

      if (!conversation) { 
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

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
                read: false,
                receiverId: conversation.participant2.id
              },
            },
          },
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            participant1Id: true,
            participant2Id: true,
            status: true,
      
            participant1: {
              select: {
                id: true,
                username: true,
                options: true,
                profile: true,
                activity: {
                  take: 4,
                  orderBy: {
                    createdAt: "desc",
                  }
                },
              },
            },
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

        const notification  = await prisma.notification.create({
          data: {
            userId: updatedConversation.participant2Id || "",
            message: `Message received from ${updatedConversation.participant1.username}`,
            action: `/dashboard/conversations?conversationId=${updatedConversation.id}`,
            type: "conversation",
            read: false,
          }

        })
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
                read: false,
                receiverId: conversation.participant1.id
              },
            },
            
          },
          include: {
            directMessages: {
              select: {
                id: true,
                userId: true,
                text: true,
                image: true,
                type: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    options: true,
                    profile: true,
                  },
                },
              },
            },
            participant2: {
              select: {
                id: true,
                username: true,
                options: true,
                profile: true
              },
            },
          },
        });
        const notification  = await prisma.notification.create({
          data: {
            userId: updatedConversation.participant1Id || "",
            message: `Message received from ${updatedConversation.participant2.username}`,
            action: `/dashboard/conversations?conversationId=${updatedConversation.id}`,
            type: "conversation",
            read: false,
          }

        })
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
