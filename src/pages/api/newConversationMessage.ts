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
  if (req.method === "POST") {

    const { userId, text, id, image, date } = req.body;

    try {
        const newMessage = await prisma.conversation.update({
            where: {
              id: id,
            },
            data: {
              updatedAt: date,
              directMessages: {
                create: {
                  userId: userId,
                  text: text,
                  image: image,
                },
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
      
      res.status(200).json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
