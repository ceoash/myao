import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { de } from "date-fns/locale";


export default async function removeBlocked(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userBlockedId, friendBlockedId } = req.body;

    const blocked = await prisma.blocked.findFirst({
      where: {
        OR: [
          { userBlockedId: userBlockedId, friendBlockedId: friendBlockedId },
          { userBlockedId: friendBlockedId, friendBlockedId: userBlockedId },
        ],
      },
    });

    if (!blocked) {
      res.status(404).json({ error: "Blocked user not found." });
      return;
    }

    const deletedFriendship = await prisma.blocked.delete({
      where: {
        id: blocked.id,
      },
    });

    res.status(200).json(deletedFriendship);
  } else {
    res.status(405).json({ error: "Method not allowed. Use POST" });
  }
}
