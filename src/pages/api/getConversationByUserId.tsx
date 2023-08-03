import { Conversation } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export interface ErrorResponse {
    error: string;
  }
  
export default async function getConversation(
    req: NextApiRequest,
    res: NextApiResponse<Conversation[] | ErrorResponse>
) {
    if (req.method === "GET") {
        let { userId } = req.query;

        if (typeof userId !== 'string') {
            return res.status(400).json({ error: "Invalid user ID." });
        }

        try {
            const conversations = await prisma.conversation.findMany({
                where: {
                    OR: [
                        { participant1Id: userId },
                        { participant2Id: userId },
                    ],
                },
                include: {
                    participant1: {
                        include: {
                            profile: true,
                            buyer: true,
                            seller: true,
                        }
                    },
                    participant2: {
                        include: {
                            profile: true,
                            buyer: true,
                            seller: true,
                        }
                    },
                },
                orderBy: { createdAt: 'asc' },
            });

            res.status(200).json(conversations);
        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(500).json({ error: "Something went wrong" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
