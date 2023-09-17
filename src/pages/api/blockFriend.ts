import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function blockFriend(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        
        const { userBlockedId, friendBlockedId } = req.body;

        if (!userBlockedId || !friendBlockedId) {
            return res.status(400).json({ error: "Missing necessary parameters." });
        }

        try {
            const newFriendshipBlock = await prisma.blocked.upsert({
                where: { userBlockedId_friendBlockedId: { userBlockedId, friendBlockedId } },
                update: {
                    userBlockedId,
                    friendBlockedId,
                },
                create: {
                    userBlockedId,
                    friendBlockedId,
                },
                select: {
                    id: true,
                    userBlockedId: true,
                    friendBlockedId: true,
                    userBlocked: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    image: true,
                                },
                            },
                        },
                    },
                    friendBlocked: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    image: true,
                                },
                            },
                        },
                    },
                },
              });
            res.status(200).json(newFriendshipBlock);
            
        } catch (error) {
            console.error("Error blocking friend:", error);
            res.status(500).json({ error: "Something went wrong." });
        }
    } else {
        res.status(405).json({ error: "Method not allowed." });
    }
}
