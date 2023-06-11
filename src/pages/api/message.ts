import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

interface ErrorResponse {
  error: string;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method === "POST") {
    const { message, userId, recipientId } = req.body;
    
    try {
      // create new conversation and a new related message
      const newConversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: recipientId,
          directMessages: {
            create: {
              userId,
              text: message,
            },
          },
        },
        include: {
          directMessages: true,
        },
      });
      
      res.status(200).json(newConversation);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
