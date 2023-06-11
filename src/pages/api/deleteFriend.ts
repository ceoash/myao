import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

interface IParams {
  userId1: string;
  userId2: string;
}

export default async function removeFriend(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userAddsId, friendAddsId } = req.body;

    // find the friendship first
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAddsId: userAddsId, friendAddsId: friendAddsId },
          { userAddsId: friendAddsId, friendAddsId: userAddsId },
        ],
      },
    });

    if (!friendship) {
      res.status(404).json({ error: "Friendship not found." });
      return;
    }

    // if friendship exists, delete it
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
