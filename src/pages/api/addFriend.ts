import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function addFriend(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ error: "Missing necessary parameters." });
        }

        try {
            const newFriendship = await prisma.friendship.upsert({
                where: { followerId_followingId: { followerId, followingId } },
                update: {
                    followerId,
                    followingId,
                },
                create: {
                    followerId,
                    followingId,
                },
                include: {
                    follower: {
                        include: {
                            profile: true,
                        }
                    },
                    following:  {
                        include: {
                            profile: true,
                    },
                }
                }
              });

            const responseFriendship = {
                ...newFriendship,
                follower: {
                    ...newFriendship.follower,
                    relationshipStatus: 'follower',
                    friendshipId: newFriendship.id,
                },
                following: {
                    ...newFriendship.following,
                    relationshipStatus: 'following',
                    friendshipId: newFriendship.id,
                },
            };
            
            res.status(200).json(responseFriendship);
            
        } catch (error) {
            console.error("Error adding friend:", error);
            res.status(500).json({ error: "Something went wrong." });
        }
    } else {
        res.status(405).json({ error: "Method not allowed." });
    }
}
