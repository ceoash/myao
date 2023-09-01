import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivity } from "@/prisma";

export default async function acceptFriendship(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {

    const { friendshipId } = req.body;

    if (!friendshipId ) res.status(400).json({ error: "Missing necessary parameters." });

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


      const now = Date.now();

      const followingNotification = await prisma.notification.create({
        data: {
          type: "friend",
          message: `You and ${responseFriendship.follower.username} are now friends`,
          userId: responseFriendship.followingId || "",
          action: `/dashboard/profile/${responseFriendship.followerId}`,
          read: false,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        },
      });

      try {
       
        res.status(200).json({ responseFriendship, followingNotification });
      } catch (error) {
        res.status(404).json({ error: "Something went wrong" });
      }
    } catch (error) {
      console.error("Error updating friendship:", error);
      res.status(500).json({ error: "Something went wrong." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
