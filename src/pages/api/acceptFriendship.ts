import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function acceptFriendship(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { friendshipId } = req.body;

    try {
      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: {
          accepted: true,
        },
        include: {
          follower: {
            include: {
              profile: true,
            },
          },
          following: {
            include: {
              profile: true,
            },
          },
        },
      });

      const responseFriendship = {
        ...updatedFriendship,
        follower: {
            ...updatedFriendship.follower,
            relationshipStatus: 'follower',
            friendshipId: updatedFriendship.id,
            accepted: updatedFriendship.accepted,
        },
        following: {
            ...updatedFriendship.following,
            relationshipStatus: 'following',
            friendshipId: updatedFriendship.id,
            accepted: updatedFriendship.accepted,
        },
    };

      res.status(200).json(responseFriendship);
    } catch (error) {
      console.error("Error updating friendship:", error);
      res.status(500).json({ error: "Something went wrong." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
