import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivityForUser } from "@/prisma";

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

    const now = Date.now()

      const followerActivity = {
        type: "FriendAdded",
        message: `You sent a friend request`,
        action: "/dashboard/offers/" + updatedFriendship.id,
        modelId: updatedFriendship.id,
        value: updatedFriendship.following.username,
        userId: updatedFriendship.followerId,
        createdAt: now,
      };
      const followingActivity = {
        type: "FriendRequest",
        message: `${
          updatedFriendship.follower.username + "wants to be your friend"
        }`,
        value: updatedFriendship.follower.username,
        action: "/dashboard/profile/" + updatedFriendship.followerId,
        modelId: updatedFriendship?.id,
        userId: updatedFriendship.followerId,
        createdAt: now,
      };

      const followerUpdate = createActivityForUser(
        updatedFriendship?.followerId,
        followerActivity,
        updatedFriendship?.follower.activities
      );
      const followingUpdate = createActivityForUser(
        updatedFriendship.followingId,
        followingActivity,
        updatedFriendship?.following.activities
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
      console.error("Error updating friendship:", error);
      res.status(500).json({ error: "Something went wrong." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
