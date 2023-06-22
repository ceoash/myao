import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";


export default async function removeFriend(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { followerId, followingId } = req.body;

    // find the friendship first
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { followerId: followerId, followingId: followingId },
          { followerId: followingId, followingId: followerId },
        ],
      },
    });

    if (!friendship) {
      res.status(404).json({ error: "Friendship not found." });
      return;
    }

    const deletedFriendship = await prisma.friendship.delete({
      where: {
        id: friendship.id,
      },
    });

    res.status(200).json(deletedFriendship);
  } else {
    res.status(405).json({ error: "Method not allowed. Use POST" });
  }
}
