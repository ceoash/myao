import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Conversation } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function accept(
  req: NextApiRequest,
  res: NextApiResponse<Conversation | ErrorResponse>
) {
      const { conversationId } = req.body;

    try {
      const listing = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: "declined" },
      });


      res.status(200).json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
