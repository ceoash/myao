import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/libs/prismadb";

export default async function loadMoreMessages(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method Not Allowed' });
      return;
    }
  
    const { conversationId, skipIndex } = req.body;
  
    try {
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          directMessages: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            skip: skipIndex || 0,
            include: {
              user: {
                include: {
                  profile: true,
                  blockedBy: true,
                  blockedFriends: true,
                },
              },
              listing: {
                include: {
                  seller: {
                    include: {
                      profile: true,
                    },
                  },
                  buyer: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' });
        return;
      }
  
      const messages = conversation.directMessages
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error('Error loading more messages:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
