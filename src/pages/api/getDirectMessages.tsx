import { DirectMessage } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export interface ErrorResponse {
    error: string;
  }

export default async function getMessages(
    req: NextApiRequest,
    res: NextApiResponse<DirectMessage[] | ErrorResponse>
) {
    if (req.method === "GET") {
        let { userId } = req.query;

        // Ensure userId is a string
        if (Array.isArray(userId)) {
            userId = userId[0];
        }

        if (!userId) {
            return res.status(400).json({ error: "Missing userId parameter" });
        }

        try {
            const messages = await prisma.directMessage.findMany({
                where: {
                    OR: [
                        { userId: userId },
                    ],
                },
                orderBy: { createdAt: 'asc' },
            });

            res.status(200).json(messages);
        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(500).json({ error: "Something went wrong" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
