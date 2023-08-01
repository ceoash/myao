import { ErrorResponse } from "@/components/modals/UserSearchModal";
import { Conversation } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function getConversationIdByParticipantIds(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {    
    if (req.method === "POST") {
        let { userId, participantId } = req.body;

        if (typeof userId !== 'string') {
            return res.status(400).json({ error: "Invalid user ID." });
        }
        if (typeof participantId !== 'string') {
            return res.status(400).json({ error: "Invalid participant ID." });
        }


        try {
            let conversation
             conversation = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { participant1Id: userId, participant2Id: participantId },
                        { participant2Id: userId, participant1Id: participantId }
                    ],
                },
               select: {
                id: true
               },
                orderBy: { createdAt: 'asc' },
            });

            

            if(!conversation?.id) {
                conversation = await prisma.conversation.create({
                    data: {
                        participant1Id: userId,
                        participant2Id: participantId
                    },
                    select: {
                        id: true
                       },
                })

               
                res.status(200).json(conversation);
            } else {
               
                res.status(200).json(conversation);
            }

        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Something went wrong" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
