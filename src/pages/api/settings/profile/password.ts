import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from ".prisma/client";
import bcrypt from "bcrypt";


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
  
  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: {
        hashedPassword: hashedPassword,
        },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

