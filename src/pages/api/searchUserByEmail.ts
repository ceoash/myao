import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from ".prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function searchUserByEmail(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>
) {
  if (req.method === "POST") {
    const { email } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}