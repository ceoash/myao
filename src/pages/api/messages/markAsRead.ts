import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { success: boolean; message: string } | { success: boolean; error: string }
  >
) {
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user || null;

  if (!session) {
    res.status(401).json({ error: "Unauthorized", success: false });
    return;
  }

  if (req.method === "PUT") {
    const { read, listingId, ...rest } = req.body;
    if (!listingId) {
      res.status(400).json({ error: "listingId is required", success: false });
      return;
    }
    const data = {
     
      read: true,
      metadata: {
        readAt: new Date().toUTCString(),
        readBy: user?.id,
      }
    };
    try {
      const count = await prisma.message.count({
        where: {
          read: false,
          listingId: listingId,
          userId: {
            not: user?.id,
          }
        },
      });

      if (count === 0) {
        res
          .status(200)
          .json({ success: true, message: "No messages to update" });
        return;
      }
      const arr = await prisma.message.updateMany({
        where: {
          read: false,
          listingId: listingId,
          userId: {
            not: user?.id,
          }
        },
        data: data,
      });

      if (!arr) {
        res
          .status(404)
          .json({ error: "unable to update messages", success: false });
        return;
      }

      res.status(200).json({ success: true, message: "Messages updated" });
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong", success: false });
    }
  }

  res.status(405).json({ error: "Method Not Allowed", success: false });
}
