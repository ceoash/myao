import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { Conversation } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function accept(
  req: NextApiRequest,
  res: NextApiResponse<Conversation | ErrorResponse>
) {
      const { conversationId } = req.body;

      const now = Date.now();

    try {
      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { 
          status: "accepted",
          updatedAt: new Date(now),
         },
      });


      res.status(200).json(conversation);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
