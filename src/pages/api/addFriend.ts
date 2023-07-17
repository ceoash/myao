import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivityForUser } from "@/prisma";

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
        ...newFriendship,
        follower: {
          ...newFriendship.follower,
          relationshipStatus: "follower",
          accepted: newFriendship.accepted,
          friendshipId: newFriendship.id,
        },
        following: {
          ...newFriendship.following,
          relationshipStatus: "following",
          accepted: newFriendship.accepted,
          friendshipId: newFriendship.id,
        },
      };

      const now = Date.now();

      const followerActivity = {
        type: "FriendAdded",
        message: `You sent a friend request`,
        action: "/dashboard/profile/" + newFriendship.id,
        modelId: newFriendship.id,
        value: newFriendship.following.username,
        userId: newFriendship.followerId,
        createdAt: now,
      };
      const followingActivity = {
        type: "FriendRequest",
        message: `${
          newFriendship.follower.username + " wants to be your friend"
        }`,
        value: newFriendship.follower.username,
        action: "/dashboard/profile/" + newFriendship.followerId,
        modelId: newFriendship?.id,
        userId: newFriendship.followerId,
        createdAt: now,
      };

      const followerUpdate = createActivityForUser(
        newFriendship?.followerId,
        followerActivity,
        newFriendship?.follower.activities
      );
      const followingUpdate = createActivityForUser(
        newFriendship.followingId,
        followingActivity,
        newFriendship?.following.activities
      );

      const transactionOperations = [followerUpdate, followingUpdate];

      try {
        const transactionResult = await prisma.$transaction(
          transactionOperations
        );
        res.status(200).json({ responseFriendship, transactionResult });
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
