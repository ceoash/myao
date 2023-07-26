import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function searchUserByUsername(
  req: NextApiRequest,
  res: NextApiResponse<User[] | ErrorResponse>
) {
  if (req.method === "POST") {
    const username = req.query.username as string;

    try {
      const users = await prisma.user.findMany({
        where: {
          username: {
            contains: username.toLowerCase(),
          },
        },
      });

      if (users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(404).json({ error: "No users found" });
      }
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}