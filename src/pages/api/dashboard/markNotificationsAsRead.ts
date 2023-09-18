import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ids = req.body;

    if (!ids) {
        return res.status(400).json({ error: "Missing necessary parameters." });
    }

  try {
    const count = await prisma.notification.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        read: true
      }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error updating unread messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
