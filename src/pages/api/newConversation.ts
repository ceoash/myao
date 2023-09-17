import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { createActivity } from "@/prisma";

interface ErrorResponse { error: string; }

export default async function newConversation(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  const now = Date.now();

  if (req.method === "POST") {
    
    const { message, userId, recipientId, username } = req.body;

    let participant1Id;
    let participant2Id;

    if (username) {
      const participant1 = await prisma.user.findUnique({
        where: { username },
      });
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
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: participant1Id, participant2Id: participant2Id },
            { participant1Id: participant2Id, participant2Id: participant1Id },
          ],
        },
        include: {
          directMessages: true,
          participant1: true,
          participant2: true,
        },
      });


      if (existingConversation) {

        const participantId = existingConversation?.participant1Id === userId ? existingConversation?.participant2Id : existingConversation?.participant1Id

        const updatedConversation = await prisma.conversation.update({
          where: {
            id: existingConversation.id,
          },
          data: {
            directMessages: {
              create: {
                userId: userId,
                text: message,
                read: false,
                receiverId: participantId
              },
            },
            updatedAt: new Date(),
          },
          include: {
            directMessages: true,
            participant1: {
              select: {
                id: true,
                username: true,
                activity: {
                  take: 4,
                  orderBy: {
                    createdAt: "desc",
                  }
                },
                blockedFriends: {
                  select: {
                    id: true,
                  }
                },
                blockedBy: {
                  select: {
                    id: true,
                  }
                },
              },
            },
            participant2: {
              select: {
                id: true,
                username: true,
                activity: {
                  include: {
                    listingActivity: true,
                    userActivity: true,
                  },
                },
                blockedFriends: {
                  select: {
                    id: true,
                  }
                },
                blockedBy: {
                  select: {
                    id: true,
                  }
                },
              },
            },
          },
        });

        if(userId === updatedConversation?.participant1Id){

          const participantActivity = createActivity({
            type: "conversation",
            message: `You received a new message`,
            userId: updatedConversation.participant2Id || "",
            user_message: `You accepted a friend request`,
            user_message_type: "message",
            action: `/dashboard/conversations?conversationId=${updatedConversation.id}`,
            receiverId: updatedConversation.participant1Id || "",
          });
          const transactionOperations = [participantActivity];

          try {
            const transactionResult = await prisma.$transaction(
              transactionOperations
            );
            res.status(200).json({ updatedConversation, transactionResult });
          } catch (error) {
            console.error("Transaction failed: ", error);
            res
              .status(500)
              .json({ error: "Something went wrong during the transaction" });
          }
        }

        if(userId === updatedConversation?.participant2Id){

          const participantActivity = createActivity({
            type: "conversation",
            message: `You received a new message`,
            userId: updatedConversation.participant1Id || "",
            user_message: `You accepted a friend request`,
            user_message_type: "message",
            action: `/dashboard/conversations?conversationId=${updatedConversation.id}`,
            receiverId: updatedConversation.participant2Id || "",
          });

          const transactionOperations = [participantActivity];

          try {
            const transactionResult = await prisma.$transaction(
              transactionOperations
            );
            res.status(200).json({ updatedConversation, transactionResult });
          } catch (error) {
            console.error("Transaction failed: ", error);
            res
              .status(500)
              .json({ error: "Something went wrong during the transaction" });
          }
        }
      } else {
        const newConversation = await prisma.conversation.create({
          data: {
            participant1Id,
            participant2Id,
            directMessages: {
              create: {
                userId,
                text: message,
                read: false,
                receiverId: participant2Id
              },
            },
          },
        });

        if(!newConversation) return res.status(500).json({ error: "Something went wrong" });  

        const updatedConversation = await prisma.conversation.update({
          where: {
            id: newConversation.id,
          },
          data: {
            
            
          },
          include: {
            participant1: true,
            participant2: true,
            
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
        try {
          res.status(200).json({ updatedConversation, notification });
        } catch (error) {
          console.error("Transaction failed: ", error);
          res
            .status(500)
            .json({ error: "Something went wrong during the transaction" });
        }
      }
    } catch (error) {
      console.error("Error creating conversation or message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
