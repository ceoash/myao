import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.query.userId as string;

  if (!userId) res.status(400).json({ error: "User ID is required" });

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,

      },
      select: {
        id: true,
        blockedFriends: {
          select: {
            friendBlockedId: true,
          }
        }
      }
    });

    if(!user) res.status(400).json({error: "No user found"})

    const count = await prisma.directMessage.count({
      where: {
        receiverId: userId,
        read: false,
        conversation: {
          status: { notIn: ['declined', 'blocked']},
        },
        userId: {
          notIn: user?.blockedFriends.map((friend) => friend.friendBlockedId)
      },
      }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
