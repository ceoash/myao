import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { createActivity } from "@/prisma";

 async function addFriend(
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

      if(!newFriendship) {
        return res.status(400).json({ error: "Could not create friendship." });
      }

      const responseFriendship = {
        ...newFriendship,
        follower: { ...newFriendship.follower },
        following: { ...newFriendship.following },
      };

      const followerActivity = createActivity({
        type: "friend",
        message: `You added ${responseFriendship.following.username}`,
        userId: responseFriendship.followerId || "",
        user_message: `Awaiting response`,
        user_message_type: "added",
        action: `/dashboard/profile/${responseFriendship.followingId}`,
        receiverId: responseFriendship.followingId || "",
      });
  
      const followingActivity = createActivity({
        type: "friend",
        message: `${responseFriendship.follower.username} wants to be your friend!`,
        userId: responseFriendship.followingId || "",
        user_message: `Awaiting response from you`,
        user_message_type: "added",
        action: `/dashboard/profile/${responseFriendship.followerId}`,
        receiverId: responseFriendship.followerId || "",
      });

      const transactionOperations = [followerActivity, followingActivity];

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


async function acceptFriendship(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { data, action } = req.body;

    try {
      const now = Date.now();

      const updatedFriendship = await prisma.friendship.update({
        where: { id: data.friendshipId },
        data: {
          accepted: true,
          updatedAt: new Date(now),
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

    const followerActivity = createActivity({
      type: "friend",
      message: `You and ${updatedFriendship.following.username} are now friends!`,
      userId: updatedFriendship.followerId || "",
      user_message: `Friend request accepted`,
      user_message_type: "accept",
      action: `/dashboard/profile/${updatedFriendship.followingId}`,
      receiverId: updatedFriendship.followingId || "",
    });

    const followingActivity = createActivity({
      type: "friend",
      message: `You and ${updatedFriendship.follower.username} are now friends!`,
      userId: updatedFriendship.followingId || "",
      user_message: `You accepted a friend request`,
      user_message_type: "accep",
      action: `/dashboard/profile/${updatedFriendship.followerId}`,
      receiverId: updatedFriendship.followerId || "",
    });

      const transactionOperations = [followerActivity, followingActivity];

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

export default async function handleFriendship(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
      const { friendshipId, action } = req.body;
  
      try {
        const now = Date.now();
  
        const updatedFriendship = await prisma.friendship.update({
          where: { id: friendshipId },
          data: {
            accepted: true,
            updatedAt: new Date(now),
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
  
  
      const followerActivity = createActivity({
        type: "friend",
        message: `You and ${updatedFriendship.following.username} are now friends!`,
        userId: updatedFriendship.followerId || "",
        user_message: `Friend request accepted`,
        user_message_type: "accept",
        action: `/dashboard/profile/${updatedFriendship.followingId}`,
        receiverId: updatedFriendship.followingId || "",
      });
  
      const followingActivity = createActivity({
        type: "friend",
        message: `You and ${updatedFriendship.follower.username} are now friends!`,
        userId: updatedFriendship.followingId || "",
        user_message: `You accepted a friend request`,
        user_message_type: "accep",
        action: `/dashboard/profile/${updatedFriendship.followerId}`,
        receiverId: updatedFriendship.followerId || "",
      });
  
        
  
        const transactionOperations = [followerActivity, followingActivity];
  
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
