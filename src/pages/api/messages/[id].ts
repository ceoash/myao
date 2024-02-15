import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { Message } from ".prisma/client";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Message | { error: string }>
) {
  const session = await getSession({ req });
  const user = session?.user;
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.method === "POST") {
    const { message, sellerId, buyerId, listingId, image, userId } = req.body;

    const now = Date.now();
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          activity: {
            include: {
              listingActivity: true,
              userActivity: true,
            },
          },
          status: true,
          id: true,
          title: true,
          buyerId: true,
          sellerId: true,
          messages: true,
        },
      });

      if (!listing) {
        res.status(404).json({ error: "listing not found" });
        return;
      }

      const updatedMessage = await prisma.listing.update({
        where: {
          id: listingId,
        },
        data: {
          updatedAt: new Date(now),
          messages: {
            create: [
              {
                buyerId: buyerId,
                sellerId: sellerId,
                text: message,
                userId: userId,
                image: image,
                read: false,
              },
            ],
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      res
        .status(200)
        .json(updatedMessage.messages[updatedMessage.messages.length - 1]);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }

  if (req.method === "PUT") {
    const session = getSession({ req });
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { id } = req.query;
    const { read, ...rest } = req.body;
    const data = {
      ...rest,
      read: true,
    };
    try {
      const message = await prisma.message.update({
        where: {
          id: String(id),
        },
        data: data
      });

      await prisma.notification.create({
        data: {
          userId: message.buyerId,
          message: `Message received from ${user?.username ? user?.username : "unknown"}`,
          action: `/dashboard/conversations?conversationId=${message.listingId}`,
          type: "conversation",
          read: false,
        },
      });
      res.status(200).json(message);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const message = await prisma.message.delete({
        where: {
          id: String(id),
        },
      });
      res.status(200).json(message);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
