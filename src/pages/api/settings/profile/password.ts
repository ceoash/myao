import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { User } from ".prisma/client";
import { NextApiRequest, NextApiResponse } from "next";


interface ErrorResponse {
  error: string;
}

export default async function UpdateProfile(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>
) {  
  const {
    password,
    id,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = Date.now()
  
  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: {
        hashedPassword: hashedPassword,
        updatedAt: new Date(now),
        },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

