import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function addFriend(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
        select: {
          id: true,
          accepted: true,
          followerId: true,
          followingId: true,
          follower: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
              activity: {
                take: 4,
                orderBy: {
                  createdAt: "desc",
                }
              },
            },
          },
          following: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
              activity: {
                take: 4,
                orderBy: {
                  createdAt: "desc",
                }
              },
            },
          },
        },
      });

      if (!newFriendship) {
        return res.status(400).json({ error: "Could not create friendship." });
      }

      const responseFriendship = {
        ...newFriendship,
        follower: { ...newFriendship.follower, relationshipStatus: "follower" },
      following: { ...newFriendship.following, relationshipStatus: "following" },
        
      };

      const now = Date.now();

      const followingNotification = await prisma.notification.create({
        data: {
          type: "friend",
          message: `${responseFriendship.follower.username} wants to be your friend!`,
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
      console.error("Error adding friend:", error);
      res.status(500).json({ error: "Something went wrong." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
