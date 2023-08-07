import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivityForUser } from "@/prisma";

interface ErrorResponse {
  error: string;
}

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
            updatedAt: new Date(),
          },
          include: {
            directMessages: true,
            participant1: {
              select: {
                id: true,
                username: true,
                activities: true,
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
                activities: true,
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

          const participantActivity = {
            type: "Conversation Message",
            message: `You received a new message`,
            value: updatedConversation.participant1?.username,
            action: "/dashboard/conversations?=" + updatedConversation.id,
            modelId: updatedConversation.id,
            userId: updatedConversation.participant1Id,
            createdAt: now,
          };

          const participant2Update = createActivityForUser(
            updatedConversation.participant2Id,
            participantActivity,
            updatedConversation.participant1.activities
          );

          const transactionOperations = [participant2Update];

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

          const participantActivity = {
            type: "Conversation Message",
            message: `You received a new message`,
            value: updatedConversation.participant2?.username,
            action: "/dashboard/conversations?=" + updatedConversation.id,
            modelId: updatedConversation.id,
            userId: updatedConversation.participant2Id,
            createdAt: now,
          };

          const participant1Update = createActivityForUser(
            updatedConversation.participant1Id,
            participantActivity,
            updatedConversation.participant2.activities
          );

          const transactionOperations = [participant1Update];

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
            activities: [
              ...(Array.isArray(newConversation?.activities)
                ? newConversation.activities
                : []),
              {
                message: "New Message",
                type: "New Conversation Started",
                action: "/conversations?=" + newConversation.id,
                userId: userId,
                value: "",
                createdAt: now,
                modelId: newConversation.id
              },
            ],
            
          },
          include: {
            participant1: true,
            participant2: true,
            
          },
        });
        const participant1Activity = {
          type: "New Conversation Started",
          message: `You started a new conversation`,
          action: "/dashboard/conversations?=" + updatedConversation.id,
          modelId: updatedConversation.id,
          value: updatedConversation.participant2.username,
          userId: updatedConversation.id,
          createdAt: now,
        };
        const participant2Activity = {
          type: "New Conversation Started",
          message: `You received a message`,
          value: updatedConversation.participant1.username,
          action: "/dashboard/conversations?=" + updatedConversation.id,
          modelId: updatedConversation?.id,
          userId: userId,
          createdAt: now,
        };

        const participant1Update = createActivityForUser(
          updatedConversation?.participant1Id,
          participant1Activity,
          updatedConversation?.participant1.activities
        );
        const participant2Update = createActivityForUser(
          updatedConversation.participant2Id,
          participant2Activity,
          updatedConversation?.participant2.activities

        );

        const transactionOperations = [participant1Update, participant2Update];

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
    } catch (error) {
      console.error("Error creating conversation or message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
